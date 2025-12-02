export type RetryOptions = {
  attempts?: number;
  delayMs?: number;
  backoffFactor?: number;
};

const circuitState: Record<string, { openUntil: number }> = {};

function isCircuitOpen(key: string) {
  const entry = circuitState[key];
  return entry ? Date.now() < entry.openUntil : false;
}

function tripCircuit(key: string, cooldownMs: number) {
  circuitState[key] = { openUntil: Date.now() + cooldownMs };
}

export function describeCircuit(key: string) {
  const entry = circuitState[key];
  if (!entry) return { key, open: false, openUntil: null as number | null };
  return { key, open: isCircuitOpen(key), openUntil: entry.openUntil };
}

export async function withRetry<T>(fn: () => Promise<T>, { attempts = 2, delayMs = 150, backoffFactor = 2 }: RetryOptions = {}, circuitKey?: string): Promise<T> {
  if (circuitKey && isCircuitOpen(circuitKey)) {
    throw new Error(`Circuit open for ${circuitKey}`);
  }

  let lastError: unknown;
  let currentDelay = delayMs;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (i < attempts - 1) {
        await new Promise((r) => setTimeout(r, currentDelay));
        currentDelay *= backoffFactor;
      }
    }
  }

  if (circuitKey) {
    tripCircuit(circuitKey, 5 * 60 * 1000); // 5 minutes cooldown
  }

  throw lastError ?? new Error("Unknown retry error");
}
