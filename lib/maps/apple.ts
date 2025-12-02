const cached: { token?: string; exp?: number } = {};

export function isAppleMapsConfigured() {
  return Boolean(process.env.APPLE_MAPS_JWT || (process.env.APPLE_MAPS_TEAM_ID && process.env.APPLE_MAPS_KEY_ID && process.env.APPLE_MAPS_PRIVATE_KEY));
}

export function getAppleJwt() {
  const now = Math.floor(Date.now() / 1000);
  if (cached.token && cached.exp && cached.exp > now + 60) {
    return cached.token;
  }
  if (process.env.APPLE_MAPS_JWT) {
    cached.token = process.env.APPLE_MAPS_JWT;
    cached.exp = now + 300;
    return cached.token;
  }
  // Placeholder token generation when private key is not configured.
  const token = `apple-maps-stub-${now}`;
  cached.token = token;
  cached.exp = now + 300;
  return token;
}
