import type { ConnectionTransport } from 'puppeteer-core';
import { WebSocket } from 'ws';

const TARGET_ID = 'uxp-plugin-page';
const SESSION_ID = 'uxp-session';
const BROWSER_CONTEXT_ID = 'uxp-browser-context';

const log = (...args: unknown[]) => console.log('[uxp-transport]', ...args);

/**
 * Creates a Puppeteer {@link ConnectionTransport} that adapts a UXP page-level
 * CDP WebSocket endpoint to look like a full Chrome browser-level endpoint.
 *
 * Puppeteer's `connect()` expects to talk to a browser-level CDP that supports
 * `Target.*` and `Browser.*` commands. UXP only exposes a page-level CDP.
 *
 * The returned transport:
 *  - Intercepts browser-level commands and returns synthetic responses
 *  - Emits `Target.targetCreated` / `Target.attachedToTarget` events as needed
 *  - Intercepts session-scoped commands that UXP doesn't support (e.g.
 *    `Page.getFrameTree`, `Page.createIsolatedWorld`, `Runtime.enable`)
 *  - Forwards all other session-scoped commands to UXP (stripping `sessionId`)
 *  - Re-wraps UXP responses with `sessionId` before delivering to Puppeteer
 *
 * @param cdpUrl             UXP CDP WebSocket URL (e.g. `ws://127.0.0.1:PORT/socket/cdt/UUID`)
 * @param executionContextId The numeric execution context ID obtained from
 *                           `waitForExecutionContextCreated` on the first CDP connection.
 *
 * @example
 * ```ts
 * import puppeteer from 'puppeteer-core';
 * import { createUxpPuppeteerTransport } from '@bubblydoo/uxp-puppeteer-transport';
 *
 * const transport = await createUxpPuppeteerTransport(cdpUrl, executionContextId);
 * const browser = await puppeteer.connect({ transport, defaultViewport: null });
 * const [page] = await browser.pages();
 * const result = await page.evaluate(() => 1 + 1);
 * ```
 */
export async function createUxpPuppeteerTransport(
  cdpUrl: string,
  executionContextId: number,
): Promise<ConnectionTransport> {
  const transport = new UxpPuppeteerTransport(cdpUrl, executionContextId);
  await transport.ready;
  return transport;
}

class UxpPuppeteerTransport implements ConnectionTransport {
  onmessage?: (message: string) => void;
  onclose?: () => void;

  readonly ready: Promise<void>;
  private ws: WebSocket;
  private executionContextId: number;

  /** Tracks outgoing Runtime.callFunctionOn / Runtime.evaluate calls with awaitPromise: true */
  private awaitPromiseCalls = new Map<number, { returnByValue?: boolean }>();
  /** Callbacks for internal CDP calls (promise polling, object serialisation) */
  private internalCallbacks = new Map<number, (msg: any) => void>();
  private nextInternalId = 1_000_000;

  constructor(cdpUrl: string, executionContextId: number) {
    this.executionContextId = executionContextId;
    this.ws = new WebSocket(cdpUrl);
    this.ready = new Promise<void>((resolve, reject) => {
      this.ws.once('open', resolve);
      this.ws.once('error', reject);
    });
    this.ws.on('message', (data) => {
      const str = String(data);
      try {
        const msg = JSON.parse(str);

        // Internal callback (promise polling, object serialisation, etc.)
        if (msg.id != null && this.internalCallbacks.has(msg.id)) {
          const cb = this.internalCallbacks.get(msg.id)!;
          this.internalCallbacks.delete(msg.id);
          cb(msg);
          return;
        }

        // Response to an awaitPromise call — may need promise polling
        if (msg.id != null && this.awaitPromiseCalls.has(msg.id)) {
          this.handleAwaitPromiseResponse(msg);
          return;
        }

        // Re-wrap with sessionId so Puppeteer routes it to the right CDPSession
        msg.sessionId = SESSION_ID;
        this.deliver(JSON.stringify(msg));
      }
      catch {
        this.deliver(str);
      }
    });
    this.ws.on('close', () => this.onclose?.());
  }

  send(message: string): void {
    let msg: any;
    try {
      msg = JSON.parse(message);
    }
    catch {
      return;
    }

    // Session-scoped command → intercept unsupported commands, forward the rest
    if (msg.sessionId === SESSION_ID) {
      log(`session cmd: ${msg.method} (id=${msg.id})`);

      // Try to handle commands that UXP doesn't support natively
      const synthetic = this.handleSessionCommand(msg);
      if (synthetic) {
        this.deliver(JSON.stringify({ ...synthetic, sessionId: SESSION_ID }));
        return;
      }

      // Track calls with awaitPromise so we can poll for the result.
      // IMPORTANT: we must strip awaitPromise before forwarding because UXP's
      // awaitPromise implementation is broken — it waits but returns {} instead
      // of the resolved value.  By sending awaitPromise: false we get the raw
      // Promise object back (with objectId) which we can poll via getProperties.
      if (
        (msg.method === 'Runtime.callFunctionOn' || msg.method === 'Runtime.evaluate')
        && msg.params?.awaitPromise
      ) {
        this.awaitPromiseCalls.set(msg.id, { returnByValue: msg.params?.returnByValue });
        // Strip both awaitPromise AND returnByValue so UXP returns the raw
        // Promise object (with objectId) instead of serialising it to {}.
        // For non-promise results we re-serialise via callFunctionOn afterwards.
        msg = { ...msg, params: { ...msg.params, awaitPromise: false, returnByValue: false } };
      }

      // Forward supported commands to UXP (strip sessionId)
      const forwarded = { ...msg };
      delete forwarded.sessionId;
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify(forwarded));
      }
      return;
    }

    // Browser-level command → handle synthetically
    const reply = this.handleBrowserCommand(msg);
    if (reply) {
      this.deliver(JSON.stringify(reply));
    }
  }

  close(): void {
    this.ws.close();
  }

  // ---------- internal ----------

  private deliver(message: string): void {
    this.onmessage?.(message);
  }

  // -------- awaitPromise polyfill via Runtime.getProperties polling --------

  /**
   * Called when UXP responds to a Runtime.callFunctionOn / Runtime.evaluate
   * that had `awaitPromise: true`. If the result is a Promise, start polling;
   * otherwise deliver the response as-is.
   */
  private handleAwaitPromiseResponse(msg: any): void {
    const info = this.awaitPromiseCalls.get(msg.id)!;
    this.awaitPromiseCalls.delete(msg.id);

    const result = msg.result?.result;

    if (result?.subtype === 'promise' && result?.objectId) {
      // Promise — poll getProperties until it settles
      this.pollPromise(msg.id, result.objectId, info.returnByValue);
    }
    else if (info.returnByValue && result?.type === 'object' && result?.objectId) {
      // Non-promise object — we stripped returnByValue, so re-serialise now
      this.serializeAndDeliver(msg.id, result.objectId);
    }
    else {
      // Primitive or null — deliver as-is
      msg.sessionId = SESSION_ID;
      this.deliver(JSON.stringify(msg));
    }
  }

  /**
   * Poll `Runtime.getProperties` on a Promise objectId until it settles,
   * then deliver the resolved (or rejected) value to Puppeteer.
   */
  private pollPromise(originalId: number, objectId: string, returnByValue?: boolean): void {
    const internalId = this.nextInternalId++;
    this.internalCallbacks.set(internalId, (msg: any) => {
      // If the CDP call itself failed (e.g. object was garbage-collected),
      // propagate as an error rather than silently resolving with undefined.
      if (msg.error) {
        this.deliver(JSON.stringify({
          id: originalId,
          sessionId: SESSION_ID,
          error: msg.error,
        }));
        return;
      }

      const internalProps: any[] = msg.result?.internalProperties || [];
      const stateP = internalProps.find((p: any) => p.name === '[[PromiseState]]');
      const resultP = internalProps.find((p: any) => p.name === '[[PromiseResult]]');
      const state = stateP?.value?.value;

      if (state === 'pending') {
        // Still pending — retry after a short delay
        setTimeout(() => this.pollPromise(originalId, objectId, returnByValue), 50);
        return;
      }

      if (state === 'rejected') {
        const errorValue = resultP?.value;
        this.deliver(JSON.stringify({
          id: originalId,
          sessionId: SESSION_ID,
          result: {
            result: { type: 'object', subtype: 'error' },
            exceptionDetails: {
              exceptionId: 1,
              text: 'Uncaught (in promise)',
              lineNumber: 0,
              columnNumber: 0,
              exception: errorValue || { type: 'string', value: 'Promise rejected' },
            },
          },
        }));
        return;
      }

      // Fulfilled
      const resolvedValue = resultP?.value || { type: 'undefined' };

      // If the caller requested returnByValue and the resolved value is an
      // object (i.e. has objectId but no serialised value), we need an extra
      // step to serialise it — Runtime.getProperties on the promise doesn't
      // honour the original returnByValue flag.
      if (returnByValue && resolvedValue.type === 'object' && resolvedValue.objectId) {
        this.serializeAndDeliver(originalId, resolvedValue.objectId);
      }
      else {
        this.deliver(JSON.stringify({
          id: originalId,
          sessionId: SESSION_ID,
          result: { result: resolvedValue },
        }));
      }
    });

    if (this.ws.readyState !== WebSocket.OPEN) {
      this.internalCallbacks.delete(internalId);
      this.deliver(JSON.stringify({
        id: originalId,
        sessionId: SESSION_ID,
        error: { code: -32000, message: 'WebSocket closed while polling promise' },
      }));
      return;
    }
    this.ws.send(JSON.stringify({
      id: internalId,
      method: 'Runtime.getProperties',
      params: { objectId },
    }));
  }

  /**
   * Use `Runtime.callFunctionOn` with `returnByValue: true` to serialise an
   * object result, then deliver it to Puppeteer.
   */
  private serializeAndDeliver(originalId: number, objectId: string): void {
    const internalId = this.nextInternalId++;
    this.internalCallbacks.set(internalId, (msg: any) => {
      if (msg.error) {
        this.deliver(JSON.stringify({
          id: originalId,
          sessionId: SESSION_ID,
          error: msg.error,
        }));
        return;
      }
      this.deliver(JSON.stringify({
        id: originalId,
        sessionId: SESSION_ID,
        result: { result: msg.result?.result || { type: 'undefined' } },
      }));
    });
    if (this.ws.readyState !== WebSocket.OPEN) {
      this.internalCallbacks.delete(internalId);
      this.deliver(JSON.stringify({
        id: originalId,
        sessionId: SESSION_ID,
        error: { code: -32000, message: 'WebSocket closed while serializing result' },
      }));
      return;
    }
    this.ws.send(JSON.stringify({
      id: internalId,
      method: 'Runtime.callFunctionOn',
      params: {
        objectId,
        functionDeclaration: 'function() { return this; }',
        returnByValue: true,
      },
    }));
  }

  // -------- session / browser command interception --------

  /**
   * Handle session-scoped commands that UXP doesn't support or handles
   * differently. Returns a synthetic response, or null to forward to UXP.
   */
  private handleSessionCommand(msg: any): any | null {
    const { id, method } = msg;

    switch (method) {
      // Puppeteer sends this to get the frame tree. UXP doesn't have real
      // frames — synthesise a single top-level frame.
      case 'Page.getFrameTree':
        return {
          id,
          result: {
            frameTree: {
              frame: {
                id: TARGET_ID,
                loaderId: 'uxp-loader',
                url: 'about:blank',
                domainAndRegistry: '',
                securityOrigin: '',
                mimeType: 'text/html',
                adFrameStatus: { adFrameType: 'none' },
              },
              childFrames: [],
            },
          },
        };

      // Puppeteer creates an isolated world for its internal __puppeteer_utility.
      case 'Page.createIsolatedWorld':
        return { id, result: { executionContextId: 99 } };

      // Puppeteer registers scripts for new documents — no-op for UXP.
      case 'Page.addScriptToEvaluateOnNewDocument':
        return { id, result: { identifier: '1' } };

      // Enable lifecycle events and immediately emit load events so Puppeteer
      // considers the page "loaded".
      case 'Page.setLifecycleEventsEnabled': {
        setTimeout(() => {
          for (const name of ['init', 'DOMContentLoaded', 'load', 'networkIdle']) {
            this.deliver(JSON.stringify({
              method: 'Page.lifecycleEvent',
              sessionId: SESSION_ID,
              params: { frameId: TARGET_ID, loaderId: 'uxp-loader', name, timestamp: Date.now() / 1000 },
            }));
          }
        }, 0);
        return { id, result: {} };
      }

      // Emit executionContextCreated so Puppeteer knows the context.
      // UXP only emits this event on the first CDP connection.
      case 'Runtime.enable': {
        setTimeout(() => {
          this.deliver(JSON.stringify({
            method: 'Runtime.executionContextCreated',
            sessionId: SESSION_ID,
            params: {
              context: {
                id: this.executionContextId,
                origin: '',
                name: '',
                uniqueId: `uxp-ctx-${this.executionContextId}`,
                auxData: { isDefault: true, type: 'default', frameId: TARGET_ID },
              },
            },
          }));
        }, 0);
        return { id, result: {} };
      }

      // Already called by the first connection — safe to return success.
      case 'Runtime.runIfWaitingForDebugger':
        return { id, result: {} };

      // Session-scoped Target.setAutoAttach — UXP doesn't have child targets.
      case 'Target.setAutoAttach':
        return { id, result: {} };

      // Emulation/Performance commands that UXP doesn't need.
      case 'Performance.enable':
      case 'Emulation.setDeviceMetricsOverride':
        return { id, result: {} };

      default:
        return null; // Forward to UXP
    }
  }

  private handleBrowserCommand(msg: any): any | null {
    const { id, method, params } = msg;
    log(`browser cmd: ${method}`);

    switch (method) {
      case 'Target.getBrowserContexts':
        return { id, result: { browserContextIds: [BROWSER_CONTEXT_ID] } };

      case 'Target.setDiscoverTargets': {
        // After responding, emit a targetCreated event for our page
        setTimeout(() => {
          this.deliver(JSON.stringify({
            method: 'Target.targetCreated',
            params: {
              targetInfo: {
                targetId: TARGET_ID,
                type: 'page',
                title: 'UXP Plugin',
                url: 'about:blank',
                attached: false,
                canAccessOpener: false,
                browserContextId: BROWSER_CONTEXT_ID,
              },
            },
          }));
        }, 0);
        return { id, result: {} };
      }

      case 'Target.getTargets': {
        // Determine the type that passes Puppeteer's filter
        const filter: { exclude: boolean; type?: string }[] | undefined = params?.filter;
        const type = filter ? findPassingType(filter) : 'page';
        return {
          id,
          result: {
            targetInfos: [{
              targetId: TARGET_ID,
              type,
              title: 'UXP Plugin',
              url: 'about:blank',
              attached: false,
              canAccessOpener: false,
              browserContextId: BROWSER_CONTEXT_ID,
            }],
          },
        };
      }

      case 'Target.attachToTarget':
        // Emit attachedToTarget event after the response
        setTimeout(() => {
          this.deliver(JSON.stringify({
            method: 'Target.attachedToTarget',
            params: {
              sessionId: SESSION_ID,
              targetInfo: {
                targetId: TARGET_ID,
                type: 'page',
                title: 'UXP Plugin',
                url: 'about:blank',
                attached: true,
                canAccessOpener: false,
                browserContextId: BROWSER_CONTEXT_ID,
              },
              waitingForDebugger: false,
            },
          }));
        }, 0);
        return { id, result: { sessionId: SESSION_ID } };

      case 'Target.setAutoAttach':
        // When autoAttach is enabled, Puppeteer expects attachedToTarget events
        // for existing targets. We deliver the event BEFORE the response so
        // that Puppeteer registers the page during connect() (not after).
        if (params?.autoAttach) {
          this.deliver(JSON.stringify({
            method: 'Target.attachedToTarget',
            params: {
              sessionId: SESSION_ID,
              targetInfo: {
                targetId: TARGET_ID,
                type: 'page',
                title: 'UXP Plugin',
                url: 'about:blank',
                attached: true,
                canAccessOpener: false,
                browserContextId: BROWSER_CONTEXT_ID,
              },
              waitingForDebugger: false,
            },
          }));
        }
        return { id, result: {} };

      case 'Target.getTargetInfo':
        return {
          id,
          result: {
            targetInfo: {
              targetId: TARGET_ID,
              type: 'page',
              title: 'UXP Plugin',
              url: 'about:blank',
              attached: true,
              canAccessOpener: false,
              browserContextId: BROWSER_CONTEXT_ID,
            },
          },
        };

      case 'Browser.getVersion':
        return {
          id,
          result: {
            protocolVersion: '1.3',
            product: 'UXP',
            revision: '0',
            userAgent: 'UXP',
            jsVersion: '',
          },
        };

      default:
        log(`  unhandled → empty result`);
        return { id, result: {} };
    }
  }
}

/**
 * Given Puppeteer's target filter (array of `{ exclude, type? }` rules),
 * find a type string that passes the filter.
 *
 * CDP target filters use "first matching rule wins" semantics: for each
 * candidate type we walk the rules in order and the first rule whose `type`
 * is either absent (catch-all) or equal to the candidate decides the outcome.
 * If no rule matches, the candidate is accepted by default.
 */
function findPassingType(filter: { exclude: boolean; type?: string }[]): string {
  const candidates = ['page', 'tab', 'iframe', 'worker', 'other'];
  for (const type of candidates) {
    let passes = true;
    for (const rule of filter) {
      // Skip rules that are type-specific but don't match this candidate
      if (rule.type !== undefined && rule.type !== type) {
        continue;
      }
      // First matching rule wins
      passes = !rule.exclude;
      break;
    }
    if (passes)
      return type;
  }
  return 'page';
}
