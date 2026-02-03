import type { CdpConnection } from './types';

export async function evaluateInCdp(
  connection: CdpConnection,
  expression: string,
  options: { awaitPromise: boolean; returnByValue: boolean } = { awaitPromise: true, returnByValue: false },
): Promise<unknown> {
  const result = await connection.cdp.Runtime.evaluate({
    expression,
    uniqueContextId: connection.executionContextUniqueId,
    awaitPromise: options.awaitPromise,
    returnByValue: options.returnByValue,
  });

  if (result.exceptionDetails) {
    const error = result.exceptionDetails.exception?.description
      || result.exceptionDetails.text
      || 'Unknown error';
    throw new Error(`Failed to evaluate in CDP: ${error}`, { cause: result.exceptionDetails });
  }

  return result.result;
}
