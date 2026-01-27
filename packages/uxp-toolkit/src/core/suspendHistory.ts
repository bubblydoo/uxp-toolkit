import type { Document } from "photoshop/dom/Document";

// The Adobe provided type is wrong
export type SuspendHistoryContext = {};
export async function suspendHistory<T>(
  document: Document,
  historyStateName: string,
  fn: (context: SuspendHistoryContext) => Promise<T>
): Promise<T> {
  let result: T | undefined;
  await document.suspendHistory(async (context) => {
    result = await fn(context);
  }, historyStateName);
  return result!;
}
