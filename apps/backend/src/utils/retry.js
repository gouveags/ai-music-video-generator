const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry(run, { retries = 20, delayMs = 2000, label = 'operation' } = {}) {
  let attempt = 0;
  let lastError;

  while (attempt < retries) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      attempt += 1;

      if (attempt >= retries) {
        break;
      }

      const jitter = Math.floor(Math.random() * 500);
      await sleep(delayMs + jitter);
    }
  }

  throw new Error(
    `${label} failed after ${retries} retries: ${lastError?.message || 'unknown error'}`
  );
}
