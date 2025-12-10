export function logInfo(
  scope: string,
  message: string,
  extras?: Record<string, unknown>
) {
  console.log(
    JSON.stringify({
      level: "info",
      scope,
      message,
      ...(extras ?? {}),
      timestamp: new Date().toISOString(),
    })
  );
}

export function logError(
  scope: string,
  message: string,
  extras?: Record<string, unknown>
) {
  console.error(
    JSON.stringify({
      level: "error",
      scope,
      message,
      ...(extras ?? {}),
      timestamp: new Date().toISOString(),
    })
  );
}
