export function isExternalConfigured() {
  return {
    zillow: Boolean(process.env.ZILLOW_API_URL && process.env.ZILLOW_API_KEY),
    rentcast: Boolean(process.env.RENTCAST_API_KEY),
  };
}
