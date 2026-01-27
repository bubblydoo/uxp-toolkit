import { useMutation, useQuery } from "@tanstack/react-query";
import { BasicStackFrame, copyToClipboard, getBasicStackFrameAbsoluteFilePath, parseUxpErrorSourcemaps } from "@bubblydoo/uxp-toolkit";

declare const __UNSOURCEMAPPED_HEADER_LINES__: number;

const UNSOURCEMAPPED_HEADER_LINES =
  typeof __UNSOURCEMAPPED_HEADER_LINES__ === "number"
    ? __UNSOURCEMAPPED_HEADER_LINES__
    : 0;

export function ErrorView({ error }: { error: Error }) {
  const sourcemappedError = useQuery({
    queryKey: ["sourcemappedError", error],
    queryFn: async () => {
      return await parseUxpErrorSourcemaps(error, {
        unsourcemappedHeaderLines: UNSOURCEMAPPED_HEADER_LINES,
      });
    },
  });

  const copyMutation = useMutation({
    mutationFn: async (frame: BasicStackFrame) => {
      await copyToClipboard(await getBasicStackFrameAbsoluteFilePath(frame));
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
