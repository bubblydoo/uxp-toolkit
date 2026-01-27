import type { Document } from "photoshop/dom/Document";
import { suspendHistory, type SuspendHistoryContext } from "../core/suspendHistory";
import { executeAsModal, type ExtendedExecutionContext } from "../core/executeAsModal";

type CombinedFn<T> = (executionContext: ExtendedExecutionContext, suspendHistoryContext: SuspendHistoryContext) => Promise<T>;

export const executeAsModalAndSuspendHistory = async <T>(commandName: string, document: Document, fn: CombinedFn<T>): Promise<T> => {
  return await executeAsModal(commandName, async (ctx) => {
    return await suspendHistory(document, commandName, (suspendHistoryContext) => fn(ctx, suspendHistoryContext));
  });
};
