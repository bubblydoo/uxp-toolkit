import type { Document } from 'photoshop';
import type { ExtendedExecutionContext } from '../core/executeAsModal';
import type { SuspendHistoryContext } from '../core/suspendHistory';
import { executeAsModal } from '../core/executeAsModal';
import { suspendHistory } from '../core/suspendHistory';

type CombinedFn<T> = (executionContext: ExtendedExecutionContext, suspendHistoryContext: SuspendHistoryContext) => Promise<T>;

export async function executeAsModalAndSuspendHistory<T>(commandName: string, document: Document, fn: CombinedFn<T>): Promise<T> {
  return await executeAsModal(commandName, async (ctx) => {
    return await suspendHistory(document, commandName, suspendHistoryContext => fn(ctx, suspendHistoryContext));
  });
}
