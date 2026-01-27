import { useMutation, useQuery } from "@tanstack/react-query";
import ErrorStackParser from "error-stack-parser";
import React, { useMemo } from "react";
import { SourceMapConsumer } from "source-map-js";
import { storage } from "uxp";
import { pathResolve } from "../lib/resolvePath";

declare const __UNSOURCEMAPPED_HEADER_LINES__: number;

const UNSOURCEMAPPED_HEADER_LINES =
  typeof __UNSOURCEMAPPED_HEADER_LINES__ === "number"
    ? __UNSOURCEMAPPED_HEADER_LINES__
    : 0;

type BasicStackFrame = Pick<
  ErrorStackParser.StackFrame,
  "functionName" | "fileName" | "lineNumber" | "columnNumber"
>;

export function ErrorView({ error }: { error: Error }) {
  const parsedError: BasicStackFrame[] | "CANNOT_PARSE_ERROR" = useMemo(() => {
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
      return "CANNOT_PARSE_ERROR";
    }
  }, [error]);

  const sourcemappedError = useQuery({
    queryKey: ["sourcemappedError", parsedError],
    queryFn: async () => {
      if (parsedError === "CANNOT_PARSE_ERROR") {
        throw new Error("Cannot parse error");
      }

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
          line: frame.lineNumber - UNSOURCEMAPPED_HEADER_LINES,
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
    },
    enabled: !!parsedError.length,
  });

  const copyMutation = useMutation({
    mutationFn: async (frame: BasicStackFrame) => {
      const pluginFolder = await (
        storage as any
      ).localFileSystem.getPluginFolder();
      const absoluteFileName = pathResolve(
        pluginFolder.nativePath,
        "index.js",
        frame.fileName!,
      ).replace(/^plugin:/, "");
      await navigator.clipboard.writeText(
        `${absoluteFileName}:${frame.lineNumber}:${frame.columnNumber}`
      );
    },
  });

  return (
    <div className="border-white border-2 rounded-md">
      <div className="border-b-2 border-white p-2">
        <div>Original error:</div>
        <div className="text-red-500 whitespace-pre-wrap">
          {errorToString(error)}
        </div>
      </div>
      <div className="p-2">
        <div>Sourcemapped error:</div>
        {copyMutation.error && (
          <>Copy error: {errorToString(copyMutation.error)}</>
        )}
        {sourcemappedError.isPending && (
          <div>⏳ Loading sourcemapped error...</div>
        )}
        {sourcemappedError.error && (
          <div>❌ Error loading sourcemapped error</div>
        )}
        {sourcemappedError.data && (
          <div className="text-red-500 whitespace-pre-wrap">
            {error.name}: {error.message}
            {sourcemappedError.data.map((frame, i) => (
              <div key={i}>
                {frame.functionName} @{" "}
                <span
                  className="underline"
                  onClick={() => copyMutation.mutate(frame)}
                >
                  {frame.fileName}:{frame.lineNumber}:{frame.columnNumber}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function errorToString(e: any): string {
  return e?.name ? `${e.name}: ${e.message} ${e.stack}` : e.toString();
}
