import type { CdpConnection } from './types';

export async function evaluateInCdp(
  connection: CdpConnection,
  expression: string,
  options: { awaitPromise: boolean; returnByValue: boolean } = { awaitPromise: true, returnByValue: false },
): Promise<unknown> {
  const contextIdArg = 'uniqueId' in connection.executionContextOrSession
    ? { uniqueContextId: connection.executionContextOrSession.uniqueId }
    : 'id' in connection.executionContextOrSession
      ? { executionContextId: connection.executionContextOrSession.id }
      : {};
  const sessionId = 'sessionId' in connection.executionContextOrSession ? connection.executionContextOrSession.sessionId : undefined;
  const result = await connection.cdp.Runtime.evaluate({
    expression,
    ...contextIdArg,
    awaitPromise: options.awaitPromise,
    returnByValue: options.returnByValue,
  }, sessionId);

  if (result.exceptionDetails) {
    const error = result.exceptionDetails.exception?.description
      || result.exceptionDetails.text
      || 'Unknown error';
    throw new Error(`Failed to evaluate in CDP: ${error}`, { cause: result.exceptionDetails });
  }

  return result.result;
}
