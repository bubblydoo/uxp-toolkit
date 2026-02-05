/* eslint-disable vars-on-top */
import type { File } from 'uxp';
import ErrorStackParser from 'error-stack-parser';
import { SourceMapConsumer } from 'source-map-js';
import { storage } from 'uxp';
import { UTError } from '../errors/ut-error';
import { pathResolve } from '../node-compat/path/resolvePath';

declare global {
  var EVAL_SOURCEMAP: string | undefined;
}

export type BasicStackFrame = Pick<
  ErrorStackParser.StackFrame,
  'functionName' | 'fileName' | 'lineNumber' | 'columnNumber'
>;

async function getEntryAssertFile(path: string): Promise<File> {
  const fs = storage.localFileSystem;
  const entry = await fs.getEntryWithUrl(path);
  if (!entry.isFile) {
    throw new Error(`Entry ${path} is not a file`);
  }
  return entry as File;
}

export async function parseUxpErrorSourcemaps(
  error: Error,
  opts: { unsourcemappedHeaderLines?: number; normalizeEvalAndAnonymous?: boolean; evalAndAnonymouseUnsourcemappedHeaderLines?: number } = {},
) {
  const parsedError = parseErrorIntoBasicStackFrames(error, {
    normalizeEvalAndAnonymous: opts.normalizeEvalAndAnonymous ?? false,
  });

  const unsourcemappedHeaderLines = opts.unsourcemappedHeaderLines ?? 0;
  const evalAndAnonymouseUnsourcemappedHeaderLines = opts.evalAndAnonymouseUnsourcemappedHeaderLines ?? 0;

  const loadedFilesCache: Record<string, File> = {};

  const parsedMappedError: BasicStackFrame[] = [];
  for (const frame of parsedError) {
    if (!frame.fileName || !frame.lineNumber || !frame.columnNumber) {
      parsedMappedError.push(frame);
      continue;
    }
    if (frame.fileName === 'eval-anonymous') {
      parsedMappedError.push(parseEvalAnonymousFrame(frame, evalAndAnonymouseUnsourcemappedHeaderLines));
      continue;
    }
    const entryPath = `plugin:${frame.fileName}`;
    const file = loadedFilesCache[entryPath] ?? await getEntryAssertFile(entryPath);
    loadedFilesCache[entryPath] = file;
    if (!file.isFile) {
      parsedMappedError.push(frame);
      continue;
    }
    const sourcemapFileEntryPath = `${entryPath}.map`;
    const sourcemapFile = loadedFilesCache[sourcemapFileEntryPath] ?? await getEntryAssertFile(sourcemapFileEntryPath);
    loadedFilesCache[sourcemapFileEntryPath] = sourcemapFile;
    if (!sourcemapFile.isFile) {
      parsedMappedError.push(frame);
      continue;
    }
    const sourcemapContents = await sourcemapFile.read();
    if (typeof sourcemapContents !== 'string') {
      throw new TypeError(`Read sourcemap ${sourcemapFileEntryPath} is not a string`);
    }
    const sourcemap = JSON.parse(sourcemapContents);
    const smc = new SourceMapConsumer(sourcemap);
    const mappedFrame = smc.originalPositionFor({
      line: frame.lineNumber - unsourcemappedHeaderLines,
      column: frame.columnNumber,
    });
    if (mappedFrame.source && mappedFrame.line && mappedFrame.column) {
      parsedMappedError.push({
        ...frame,
        fileName: mappedFrame.source,
        lineNumber: mappedFrame.line,
        columnNumber: mappedFrame.column,
      });
    }
    else {
      parsedMappedError.push(frame);
    }
  }

  return parsedMappedError;
}

function parseEvalAnonymousFrame(frame: BasicStackFrame, evalAndAnonymouseUnsourcemappedHeaderLines: number): BasicStackFrame {
  if (typeof EVAL_SOURCEMAP === 'string') {
    const sourcemap = JSON.parse(EVAL_SOURCEMAP);
    const smc = new SourceMapConsumer(sourcemap);
    const mappedFrame = smc.originalPositionFor({
      line: frame.lineNumber! - evalAndAnonymouseUnsourcemappedHeaderLines,
      column: frame.columnNumber!,
    });
    if (mappedFrame.source && mappedFrame.line && mappedFrame.column) {
      return {
        ...frame,
        fileName: mappedFrame.source,
        lineNumber: mappedFrame.line!,
        columnNumber: mappedFrame.column!,
      };
    }
  }
  return frame;
}

export function replaceEvalAndAnonymousStack(stack: string) {
  return stack.replace(/eval at importFile \(:(\d+):(\d+)\), /g, '').replaceAll('<anonymous>', 'eval-anonymous');
}

export function parseErrorIntoBasicStackFrames(error: Error, options: { normalizeEvalAndAnonymous?: boolean } = {}): BasicStackFrame[] {
  try {
    const errorWithEvalTakenOut = options.normalizeEvalAndAnonymous
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack ? replaceEvalAndAnonymousStack(error.stack) : undefined,
        }
      : error;
    const frames = ErrorStackParser.parse(errorWithEvalTakenOut);
    return frames.map((frame) => {
      return {
        functionName: frame.functionName,
        fileName: frame.fileName,
        lineNumber: frame.lineNumber,
        columnNumber: frame.columnNumber,
      };
    });
  }
  catch (e) {
    throw new UTStacktraceParsingError('Failed to parse error stack trace', { cause: e });
  }
}

export async function getBasicStackFrameAbsoluteFilePath(frame: BasicStackFrame): Promise<string> {
  const pluginFolder = await storage.localFileSystem.getPluginFolder();
  const absoluteFileName = pathResolve(
    pluginFolder.nativePath,
    'index.js',
    frame.fileName!,
  ).replace(/^plugin:/, '');
  return `${absoluteFileName}:${frame.lineNumber}:${frame.columnNumber}`;
}

export class UTStacktraceParsingError extends UTError {
  public override readonly name = 'UTStacktraceParsingError';

  constructor(message: string, opts: ErrorOptions = {}) {
    super(message, opts);
  }
}
