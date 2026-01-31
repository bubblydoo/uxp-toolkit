import { core } from 'photoshop';
import { createModifyingBatchPlayContext } from './command';

// copied from devtools:
// hostControl: {suspendHistory: ƒ, resumeHistory: ƒ, registerAutoCloseDocument: ƒ, unregisterAutoCloseDocument: ƒ}
// mode: "action"
// uiMode: "never"
// finalizeArguments: ƒ ()
// isCancelled: undefined
// onCancel: undefined
// reject: ƒ ()
// reportProgress: ƒ ()
// resolve: ƒ ()

export interface CorrectExecutionContext {
  /**
   * True if user has cancelled the modal interaction.
   *
   * User can cancel by hitting the Escape key, or by pressing the "Cancel" button in the progress bar.
   */
  isCancelled: boolean;
  /**
   * If assigned a method, it will be called when user cancels the modal interaction.
   */
  onCancel: () => void;
  /**
   * Call this to customize the progress bar.
   */
  reportProgress: (info: {
    value: number;
    commandName?: string;
  }) => void;
  /**
   * Use the methods in here to control Photoshop state
   */
  hostControl: {
    /**
     * Call to suspend history on a target document, returns the suspension ID which can be used for resumeHistory
     */
    suspendHistory: (info: {
      documentID: number;
      name: string;
    }) => Promise<number>;
    /**
     * Call to resume history on a target document
     */
    resumeHistory: (suspensionID: number, commit: boolean) => Promise<void>;
    /** Register a document to be closed when the modal scope exits. See below for details. */
    registerAutoCloseDocument: (documentID: number) => Promise<void>;
    /** Unregister a document from being closed when the modal scope exits */
    unregisterAutoCloseDocument: (documentID: number) => Promise<void>;
  };
}

export interface CorrectExecuteAsModalOptions {
  commandName: string;
  interactive?: boolean;
  timeOut?: number;
}

export type ExtendedExecutionContext = Omit<CorrectExecutionContext, 'onCancel'> & ReturnType<typeof createModifyingBatchPlayContext> & {
  signal: AbortSignal;
};

const originalExecuteAsModal: <T>(fn: (executionContext: CorrectExecutionContext) => Promise<void>, opts: CorrectExecuteAsModalOptions) => Promise<T> = core.executeAsModal as any;

type OptionsWithoutCommandName = Omit<CorrectExecuteAsModalOptions, 'commandName'>;

export async function executeAsModal<T>(commandName: string, fn: (executionContext: ExtendedExecutionContext) => Promise<T>, opts?: OptionsWithoutCommandName): Promise<T> {
  let error: unknown;
  let result: T;
  await originalExecuteAsModal(async (executionContext) => {
    const abortController = new AbortController();
    executionContext.onCancel = () => {
      abortController.abort();
    };
    // we cannot do a spread here, because not all properties are enumerable
    const extendedExecutionContext: ExtendedExecutionContext = {
      isCancelled: executionContext.isCancelled,
      reportProgress: executionContext.reportProgress,
      hostControl: executionContext.hostControl,
      signal: abortController.signal,
      ...createModifyingBatchPlayContext(),
    };
    try {
      result = await fn(extendedExecutionContext);
    }
    catch (e) {
      console.error('error in executeAsModal');
      console.error(e);
      error = e;
    }
  }, {
    commandName,
    ...opts,
  });
  if (error) {
    throw error;
  }
  else {
    return result!;
  }
}
