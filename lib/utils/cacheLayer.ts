import { getCache, setCache, getTTL } from "@/lib/utils/cache";

export function cacheInsight(key: string, value?: unknown) {
  if (value !== undefined) setCache(`insight:${key}`, value, getTTL("insights"));
  return getCache(`insight:${key}`);
}

export function cacheQuote(key: string, value?: unknown) {
  if (value !== undefined) setCache(`quote:${key}`, value, getTTL("quotes"));
  return getCache(`quote:${key}`);
}

export function cacheAerial(key: string, value?: unknown) {
  if (value !== undefined) setCache(`aerial:${key}`, value, getTTL("aerial"));
  return getCache(`aerial:${key}`);
}

export function cacheSchedule(key: string, value?: unknown) {
  if (value !== undefined) setCache(`schedule:${key}`, value, getTTL("schedule"));
  return getCache(`schedule:${key}`);
}

export function cachePortalSession(key: string, value?: unknown) {
  if (value !== undefined) setCache(`portal:${key}`, value, getTTL("portal"));
  return getCache(`portal:${key}`);
}
