const activity = new Map<string, Array<{ at: string; action: string; detail?: Record<string, unknown> }>>();

export function recordPortalActivity(token: string, action: string, detail?: Record<string, unknown>) {
  const list = activity.get(token) || [];
  list.push({ at: new Date().toISOString(), action, detail });
  activity.set(token, list);
}

export function getPortalActivity(token: string) {
  return activity.get(token) || [];
}
