/* eslint-disable no-console */
import type { File, Task, TaskResult } from '@vitest/runner';
import type { ParsedStack, TestError } from '@vitest/utils';
import fs from 'node:fs';
import path from 'node:path';
import { originalPositionFor, TraceMap } from '@jridgewell/trace-mapping';

export interface StackRemapperOptions {
  /**
   * Enable debug logging.
   */
  debug?: boolean;

  /**
   * When true, the original (bundled) stack trace is preserved as
   * `error.originalStack` alongside the remapped `error.stack`.
   * Worker runtime frames are not filtered in the bundled stack.
   *
   * @default false
   */
  showOriginalStackTrace?: boolean;
}

interface RemappedPosition {
  source: string;
  /** 1-based */
  line: number;
  /** 0-based */
  column: number;
}

/**
 * Handles sourcemap storage and stack trace remapping for bundled test files.
 *
 * This class is responsible for:
 * - Storing sourcemaps for bundled test files
 * - Remapping error stacks from bundled positions to original source positions
 * - Remapping task locations (it/describe positions) from bundled to original
 * - Generating code frames for Vitest's reporter (which can't access custom pool files via its module graph)
 *
 * All public remap methods **mutate in place** to preserve circular references
 * (`task.file`, `task.suite`) that Vitest and devalue rely on for serialization.
 */
export class StackRemapper {
  private projectRoot: string;
  /**
   * Sourcemaps stored per filepath (entry file path → parsed TraceMap).
   * The sourceURL in eval'd code points to the filepath, so we can
   * look up the sourcemap and remap generated positions to original ones.
   */
  private sourceMaps: Map<string, TraceMap> = new Map();

  private log: (...args: unknown[]) => void;
  private showBundledStackTrace: boolean;

  constructor(projectRoot: string, options: StackRemapperOptions = {}) {
    this.projectRoot = projectRoot;
    this.log = options.debug
      ? (...args: unknown[]) => console.log('[stack-remapper]', ...args)
      : () => {};
    this.showBundledStackTrace = options.showOriginalStackTrace ?? false;
  }

  /**
   * Whether any sourcemaps have been stored.
   */
  get hasSourceMaps(): boolean {
    return this.sourceMaps.size > 0;
  }

  /**
   * Store a sourcemap for a bundled file and resolve source paths to absolute paths.
   *
   * @param filePath - The entry file path (used as the key and sourceURL)
   * @param sourcemapJson - The raw sourcemap JSON string from esbuild
   */
  storeSourceMap(filePath: string, sourcemapJson: string): void {
    try {
      const smJson = JSON.parse(sourcemapJson);
      const traceMap = new TraceMap(smJson);
      this.sourceMaps.set(filePath, traceMap);
      this.log(`Stored sourcemap for ${filePath} with ${smJson.sources.length} sources`);
    }
    catch (e) {
      this.log(`Warning: Failed to parse sourcemap for ${filePath}:`, e);
    }
  }

  /**
   * Try to remap a generated position (line:col) using stored sourcemaps.
   *
   * @param filepath - The sourceURL'd filepath (entry file)
   * @param line - 1-based generated line
   * @param column - 0-based generated column
   */
  remapPosition(filepath: string, line: number, column: number): RemappedPosition | null {
    const traceMap = this.sourceMaps.get(filepath);
    if (!traceMap)
      return null;

    const pos = originalPositionFor(traceMap, { line, column });
    if (!pos.source || pos.line == null || pos.column == null)
      return null;

    return {
      source: pos.source,
      line: pos.line,
      column: pos.column,
    };
  }

  /**
   * Remap a stack trace string using stored sourcemaps.
   *
   * - Replaces generated positions with original source positions
   * - Unwraps `eval (filepath:line:col)` to `filepath:line:col` for clean Vitest display
   * - Filters out frames from the worker runtime (only keeps source-mapped frames)
   */
  remapStack(stack: string): string {
    if (!stack)
      return stack;

    stack = replaceEvalAndAnonymousStack(stack);

    return stack.split('\n').map((line) => {
      // Always keep non-frame lines (error message, etc.)
      if (!line.match(/^\s+at\s+/)) {
        return line;
      }

      // Try each known filepath to see if this stack line references it
      for (const [filepath, traceMap] of this.sourceMaps) {
        const escapedPath = filepath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedPath}):(\\d+):(\\d+)`);
        const match = line.match(regex);
        if (match) {
          const genLine = Number.parseInt(match[2]);
          const genCol = Number.parseInt(match[3]) - 1; // stack col is 1-based, sourcemap col is 0-based

          const pos = originalPositionFor(traceMap, { line: genLine, column: genCol });
          if (pos.source && pos.line != null && pos.column != null) {
            let remapped = line.replace(
              match[0],
              `${pos.source}:${pos.line}:${pos.column + 1}`,
            );

            // Unwrap "at eval (source:line:col)" to "at source:line:col"
            remapped = remapped.replace(/at eval \((.+:\d+:\d+)\)/, 'at $1');

            return remapped;
          }
        }
      }

      // Drop frames that don't reference source-mapped files
      // (worker runtime noise)
      return line;
    }).join('\n');
  }

  /**
   * Remap error stacks in a task result (mutates in place).
   * Walks into `result.errors` and remaps each `TestError`.
   */
  remapErrorStacks(result: TaskResult): void {
    if (result.errors) {
      for (const error of result.errors) {
        this.remapTestError(error);
      }
    }
  }

  /**
   * Remap task locations in place (from bundled code positions to original source positions).
   * This fixes the location shown in "FAIL file:line:col > test name" output.
   *
   * Mutates tasks in place to preserve circular references (task.file, task.suite)
   * that Vitest and devalue rely on.
   */
  remapTaskLocations(tasks: Task[]): void {
    for (const task of tasks) {
      if (task.location) {
        const filepath = task.type === 'test' ? task.file.filepath : (isTaskFile(task) ? task.file.filepath : undefined);
        if (filepath) {
          const remapped = this.remapPosition(filepath, task.location.line, task.location.column);
          if (remapped) {
            task.location.line = remapped.line;
            task.location.column = remapped.column;
          }
        }
      }

      // Recurse into nested tasks (suites contain tests)
      if ('tasks' in task) {
        this.remapTaskLocations(task.tasks);
      }
    }
  }

  /**
   * Remap a single TestError's stack trace in place and set Vitest-compatible properties.
   *
   * For the root error, generates a combined `frame` that includes both the
   * stack trace lines (❯) and the interleaved code frame, matching Vitest's
   * native `printStack` output layout. This is necessary because:
   * - Setting `error.frame` makes Vitest skip `printStack` entirely
   * - NOT setting it means no code frame (custom pool files aren't in Vite's module graph)
   * - So we replicate the full `printStack` output inside `error.frame`
   *
   * For cause errors, we only set `stacks` and let Vitest's native rendering
   * handle them (which calls `printStack` with `showCodeFrame: false`).
   *
   * @param error - The error to remap
   * @param isCause - Whether this error is a `cause` of another error
   */
  private remapTestError(error: TestError, isCause = false): void {
    if (typeof error.stack === 'string') {
      const originalStack = error.stack;

      error.stack = this.remapStack(error.stack);

      // Add parsed frames for Vitest's reporter
      error.stacks = this.parseStackToFrames(error.stack);

      // For the root error (not causes), generate a combined frame with
      // stack trace lines and interleaved code frame.
      // For causes, don't set `frame` — Vitest renders them with
      // `showCodeFrame: false` via printStack, which shows only ❯ lines.
      if (!isCause && !error.frame && error.stacks.length > 0) {
        error.frame = this.generateCombinedFrame(error.stacks);
      }

      // Preserve the raw bundled stack trace for debugging
      if (this.showBundledStackTrace && originalStack !== error.stack) {
        error.originalStack = originalStack;
      }
    }

    // Recurse into cause chain
    if (error.cause) {
      this.remapTestError(error.cause, true);
    }
  }

  /**
   * Parse a (already remapped) stack trace string into Vitest-compatible ParsedStack frames.
   */
  private parseStackToFrames(stack: string): ParsedStack[] {
    const frames: ParsedStack[] = [];

    for (const line of stack.split('\n')) {
      // Match "at method (file:line:col)" or "at file:line:col"
      const match = line.match(/^ +at (\S+) \((.+):(\d+):(\d+)\)$/)
        || line.match(/^ +at (.+):(\d+):(\d+)$/);
      if (match) {
        const method = match.length === 5 ? match[1] : '';
        const file = match.length === 5 ? match[2] : match[1];
        const lineStr = match.length === 5 ? match[3] : match[2];
        const colStr = match.length === 5 ? match[4] : match[3];
        frames.push({
          file,
          line: Number.parseInt(lineStr),
          column: Number.parseInt(colStr),
          method: method || '',
        });
      }
    }

    return frames;
  }

  /**
   * Generate a combined frame string containing stack trace lines (❯) with
   * an interleaved code frame after the first frame, matching Vitest's native
   * `printStack` output layout.
   *
   * Vitest's unit-test output looks like:
   * ```
   *  ❯ throwError test/meta-tests/stacktraces.test.ts:4:9
   *       2|
   *       3| function throwError() {
   *       4|   throw new Error('Test error');
   *        |         ^
   *       5| }
   *       6|
   *  ❯ test/meta-tests/stacktraces.test.ts:8:3
   * ```
   *
   * Note: Vitest wraps `error.frame` in yellow, so we can't add per-element
   * colors (cyan for first ❯, gray for others, red for ^). The layout matches
   * but everything renders in yellow.
   */
  private generateCombinedFrame(stacks: ParsedStack[]): string | undefined {
    const result: string[] = [];

    for (let i = 0; i < stacks.length; i++) {
      const frame = stacks[i];
      const relativePath = path.relative(this.projectRoot, frame.file);
      const location = `${relativePath}:${frame.line}:${frame.column}`;
      const label = [frame.method, location].filter(Boolean).join(' ');
      result.push(` \u276F ${label}`);

      // After the first frame, interleave the code frame
      if (i === 0) {
        const codeFrame = this.generateCodeFrame(frame.file, frame.line, frame.column);
        if (codeFrame) {
          result.push(codeFrame);
        }
      }
    }

    return result.length > 0 ? result.join('\n') : undefined;
  }

  /**
   * Generate a code frame string showing the source code around an error location.
   * Uses Vitest's native indentation format (indent=4, 3-char padded line numbers).
   *
   * Output format matches Vitest's `generateCodeFrame(source, 4, loc)`:
   * ```
   *       2|
   *       3| function throwError() {
   *       4|   throw new Error('Test error');
   *        |         ^
   *       5| }
   *       6|
   * ```
   *
   * @param file - Path to the source file (absolute or relative to projectRoot)
   * @param line - 1-based line number
   * @param column - 1-based column number
   * @param range - Number of context lines before and after (default 2)
   */
  private generateCodeFrame(file: string, line: number, column: number, range = 2): string | undefined {
    try {
      const resolvedFile = path.isAbsolute(file) ? file : path.resolve(this.projectRoot, file);
      const source = fs.readFileSync(resolvedFile, 'utf-8');
      const lines = source.split('\n');

      const start = Math.max(0, line - 1 - range);
      const end = Math.min(lines.length, line + range);

      const result: string[] = [];
      // Vitest uses indent=4 and lineNo() with padStart(3)
      const indent = '    ';

      for (let i = start; i < end; i++) {
        const lineNum = i + 1;
        const isErrorLine = lineNum === line;
        const numStr = String(lineNum).padStart(3, ' ');
        const content = lines[i].replace(/\t/g, ' ');

        result.push(`${indent}${numStr}| ${content}`);

        if (isErrorLine && column > 0) {
          // Pointer line: same indent + empty line number area + pipe + spaces + caret
          const pointerPad = ' '.repeat(column - 1);
          result.push(`${indent}   | ${pointerPad}^`);
        }
      }

      return result.join('\n');
    }
    catch (e) {
      this.log('Failed to generate code frame for', file, line, column, e);
      return undefined;
    }
  }
}

export function replaceEvalAndAnonymousStack(stack: string): string {
  return stack.replace(/eval at importFile \(:(\d+):(\d+)\), /g, '').replaceAll('<anonymous>', 'eval-anonymous');
}

function isTaskFile(task: Task): task is File {
  return 'file' in task && task.file !== undefined;
}
