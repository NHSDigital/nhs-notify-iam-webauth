/* eslint-disable no-await-in-loop, no-plusplus, unicorn/consistent-function-scoping */

export function sleep(millis: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, millis);
  });
}

export async function poll(
  durationMs: number,
  operation: (attemptNumber: number) => Promise<boolean>
): Promise<void> {
  const startTime = Date.now();
  let success = false;
  let attemptNumber = 1;
  while (!success && Date.now() < startTime + durationMs) {
    success = await operation(attemptNumber);
    if (!success) {
      await sleep(500);
    }
    attemptNumber++;
  }

  if (!success) {
    throw new Error('Timed out polling');
  }
}

export async function batchPromises<T>(
  asyncFunctions: Array<() => Promise<T>>,
  batchSize: number
): Promise<Array<T>> {
  const batches = [];

  for (let i = 0; i < asyncFunctions.length; i += batchSize) {
    const batch = asyncFunctions.slice(i, i + batchSize);

    const batchExecutor = async () => {
      const results: Array<T> = [];
      for (const job of batch) {
        const result = await job();
        results.push(result);
      }
      return results;
    };
    batches.push(batchExecutor);
  }

  const results = await Promise.all(
    batches.map((batchExecutor) => batchExecutor())
  );
  return results.flat();
}
