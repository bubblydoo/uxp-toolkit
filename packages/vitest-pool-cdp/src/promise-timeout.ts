export interface PromiseTimeoutOptions<T> {
  timeout: number;
  timeoutMessage: string;
  onLateResolve?: (value: T) => void | Promise<void>;
  onLateReject?: (error: unknown) => void;
}

export async function withPromiseTimeout<T>(
  promise: Promise<T>,
  options: PromiseTimeoutOptions<T>,
): Promise<T> {
  const { timeout, timeoutMessage, onLateResolve, onLateReject } = options;

  const timeoutError = new Error(timeoutMessage);
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(timeoutError);
    }, timeout);
  });

  try {
    return await Promise.race<T>([
      promise,
      timeoutPromise,
    ]);
  }
  catch (error) {
    if (error === timeoutError) {
      promise.then((lateValue) => {
        return onLateResolve?.(lateValue);
      }).catch((lateError) => {
        onLateReject?.(lateError);
      });
    }
    throw error;
  }
  finally {
    if (timeoutHandle) {
      clearTimeout(timeoutHandle);
    }
  }
}
