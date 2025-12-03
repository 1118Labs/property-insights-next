// Simple unique correlation ID generator
export function createCorrelationId(): string {
  return (
    "corr-" +
    Math.random().toString(36).substring(2, 10) +
    "-" +
    Date.now().toString(36)
  );
}
