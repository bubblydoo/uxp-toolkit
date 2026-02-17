import type { ExecuteAsModalOptions, ExecutionContext } from 'adobe:photoshop';
import { core } from 'adobe:photoshop';
import { createModifyingBatchPlayContext } from './command';

export type ExtendedExecutionContext = Omit<ExecutionContext, 'onCancel'> & ReturnType<typeof createModifyingBatchPlayContext> & {
  signal: AbortSignal;
};

type OptionsWithoutCommandName = Omit<ExecuteAsModalOptions, 'commandName'>;

export async function executeAsModal<T>(commandName: string, fn: (executionContext: ExtendedExecutionContext) => Promise<T>, opts?: OptionsWithoutCommandName): Promise<T> {
  let error: unknown;
  let result: T;
  await core.executeAsModal(async (executionContext) => {
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
