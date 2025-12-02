let counters: Record<string, number> = {};
let events: Array<{ type: string; detail?: Record<string, unknown>; at: number }> = [];
type ProviderHealth = { calls: number; errors: number; totalDuration: number; lastError?: string; lastUpdated: number; durations: number[] };

let providerHealthState: Record<string, ProviderHealth> = {};

export function incrCounter(key: string, delta = 1) {
  counters[key] = (counters[key] || 0) + delta;
}

export function getCounters() {
  return { ...counters };
}

export function logEvent(type: string, detail?: Record<string, unknown>) {
  events.push({ type, detail, at: Date.now() });
  if (events.length > 500) events = events.slice(-500);
}

export function getEvents() {
  return [...events];
}

export function recordProviderMetric(label: string, durationMs: number, error = false, detail?: string) {
  const health = providerHealthState[label] || { calls: 0, errors: 0, totalDuration: 0, lastUpdated: Date.now(), durations: [] };
  health.calls += 1;
  health.totalDuration += durationMs;
  health.durations.push(durationMs);
  if (error) {
    health.errors += 1;
    health.lastError = detail;
  }
  health.lastUpdated = Date.now();
  providerHealthState[label] = health;
}

export function getProviderHealth() {
  const result: Record<string, { uptime: number; errorRate: number; avgMs: number; lastError?: string; lastUpdated: number; histogram: number[] }> = {};
  for (const [label, h] of Object.entries(providerHealthState)) {
    const errorRate = h.calls ? h.errors / h.calls : 0;
    const avgMs = h.calls ? h.totalDuration / h.calls : 0;
    const uptime = 1 - errorRate;
    result[label] = { uptime, errorRate, avgMs, lastError: h.lastError, lastUpdated: h.lastUpdated, histogram: buildHistogram(h.durations) };
  }
  return result;
}

export function getProviderLatencySnapshot() {
  return Object.fromEntries(
    Object.entries(providerHealthState).map(([k, v]) => [
      k,
      { avgMs: v.calls ? v.totalDuration / v.calls : 0, errors: v.errors, calls: v.calls },
    ])
  );
}

export function resetCounters() {
  counters = {};
  events = [];
  providerHealthState = {};
}

function buildHistogram(durations: number[]) {
  const buckets = [0, 50, 100, 200, 500, 1000, 2000];
  const counts = new Array(buckets.length).fill(0);
  durations.forEach((d) => {
    for (let i = 0; i < buckets.length; i++) {
      if (d <= buckets[i]) {
        counts[i] += 1;
        return;
      }
    }
  });
  return counts;
}
