import { importPKCS8, SignJWT } from "jose";

const ALG = "ES256";

async function generateAppleMapJWT() {
  const teamId = process.env.APPLE_TEAM_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const privateKey = process.env.APPLE_PRIVATE_KEY;

  if (!teamId || !keyId || !privateKey) {
    console.warn("Apple Maps credentials are not fully configured.");
    return null;
  }

  const normalizedKey = privateKey.replace(/\\n/g, "\n");
  const key = await importPKCS8(normalizedKey, ALG);

  return new SignJWT({})
    .setProtectedHeader({ alg: ALG, kid: keyId, typ: "JWT" })
    .setIssuer(teamId)
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(key);
}

export async function getMapSnapshot(lat?: number, lng?: number): Promise<string | null> {
  if (typeof lat !== "number" || typeof lng !== "number" || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  const token = await generateAppleMapJWT();
  if (!token) return null;

  const url = new URL("https://snapshot.apple-mapkit.com/api/v1/snapshot");
  url.searchParams.set("center", `${lat},${lng}`);
  url.searchParams.set("z", "16");
  url.searchParams.set("size", "600x400");
  url.searchParams.set("teamId", process.env.APPLE_TEAM_ID || "");
  url.searchParams.set("keyId", process.env.APPLE_KEY_ID || "");
  url.searchParams.set("signature", token);

  return url.toString();
}
