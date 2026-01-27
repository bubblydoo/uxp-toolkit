import ErrorStackParser from "error-stack-parser";
import { SourceMapConsumer } from "source-map-js";
import { storage } from "uxp";
import { pathResolve } from "../node-compat/path/resolvePath";
import { UTError } from "../errors/ut-error";

export type BasicStackFrame = Pick<
  ErrorStackParser.StackFrame,
  "functionName" | "fileName" | "lineNumber" | "columnNumber"
>;

export async function parseUxpErrorSourcemaps(error: Error, opts: { unsourcemappedHeaderLines?: number } = {}) {
  const parsedError = parseErrorIntoBasicStackFrames(error);

  const unsourcemappedHeaderLines = opts.unsourcemappedHeaderLines ?? 0;

  const loadedFilesCache: Record<string, storage.File> = {};

  const fs = (storage as any).localFileSystem;
  const parsedMappedError: BasicStackFrame[] = [];
  for (const frame of parsedError) {
    if (!frame.fileName || !frame.lineNumber || !frame.columnNumber) {
      parsedMappedError.push(frame);
      continue;
    }
    const entryPath = "plugin:" + frame.fileName;
    const file =
      loadedFilesCache[entryPath] ??
      ((await fs.getEntryWithUrl(entryPath)) as storage.File);
    loadedFilesCache[entryPath] = file;
    if (!file.isFile) {
      parsedMappedError.push(frame);
      continue;
    }
    const sourcemapFileEntryPath = entryPath + ".map";
    const sourcemapFile =
      loadedFilesCache[sourcemapFileEntryPath] ??
      ((await fs.getEntryWithUrl(sourcemapFileEntryPath)) as storage.File);
    loadedFilesCache[sourcemapFileEntryPath] = sourcemapFile;
    if (!sourcemapFile.isFile) {
      parsedMappedError.push(frame);
      continue;
    }
    const sourcemapContents = (await sourcemapFile.read({})) as string;
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
      } as ErrorStackParser.StackFrame);
    } else {
      parsedMappedError.push(frame);
    }
  }

  return parsedMappedError;
}

function parseErrorIntoBasicStackFrames(error: Error): BasicStackFrame[] {
  try {
    const frames = ErrorStackParser.parse(error);
    return frames.map((frame) => {
      return {
        functionName: frame.functionName,
        fileName: frame.fileName,
        lineNumber: frame.lineNumber,
        columnNumber: frame.columnNumber,
      };
    });
  } catch (e) {
    throw new UTStacktraceParsingError("Failed to parse error stack trace", { cause: e });
  }
}

export async function getBasicStackFrameAbsoluteFilePath(frame: BasicStackFrame): Promise<string> {
  const pluginFolder = await (
    storage as any
  ).localFileSystem.getPluginFolder();
  const absoluteFileName = pathResolve(
    pluginFolder.nativePath,
    "index.js",
    frame.fileName!,
  ).replace(/^plugin:/, "");
  return `${absoluteFileName}:${frame.lineNumber}:${frame.columnNumber}`;
}

export class UTStacktraceParsingError extends UTError {
  public override readonly name = "UTStacktraceParsingError";

  constructor(message: string, opts: ErrorOptions = {}) {
    super(message, opts);
  }
}