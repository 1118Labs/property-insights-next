import { randomUUID } from "crypto";
import { portalInviteSchema, PortalInvite, PortalSession } from "@/lib/portal/domain";
import { logEvent } from "@/lib/utils/telemetry";
import { cachePortalSession } from "@/lib/utils/cacheLayer";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const invites = new Map<string, PortalInvite>();

function prune(invite: PortalInvite): PortalInvite {
  const now = Date.now();
  const exp = new Date(invite.expiresAt).getTime();
  if (exp < now && invite.status === "pending") {
    invite.status = "expired";
  }
  return invite;
}

export function createInvite(payload: { clientId: string; propertyId: string; quoteId?: string | null }) {
  const token = randomUUID();
  const now = new Date();
  const invite: PortalInvite = {
    token,
    clientId: payload.clientId,
    propertyId: payload.propertyId,
    quoteId: payload.quoteId || null,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + INVITE_TTL_MS).toISOString(),
    status: "pending",
  };
  invites.set(token, invite);
  logEvent("portal_invite", { token, propertyId: payload.propertyId });
  return invite;
}

export function getInvite(token: string): PortalInvite | null {
  const invite = invites.get(token);
  if (!invite) return null;
  const updated = prune(invite);
  invites.set(token, updated);
  return updated;
}

export function verifyInvite(token: string): PortalSession | null {
  const invite = getInvite(token);
  if (!invite) return null;
  const cached = cachePortalSession(token);
  if (cached) return cached as PortalSession;
  const session: PortalSession = {
    token: invite.token,
    clientId: invite.clientId,
    propertyId: invite.propertyId,
    quoteId: invite.quoteId,
    expiresAt: invite.expiresAt,
    status: invite.status,
  };
  logEvent("portal_verify", { token, status: session.status });
  cachePortalSession(token, session);
  return session;
}

export function approveInvite(token: string) {
  const invite = getInvite(token);
  if (!invite) return null;
  const updated = { ...invite, status: "approved", approvedAt: new Date().toISOString() } as PortalInvite;
  invites.set(token, updated);
  logEvent("portal_approved", { token, propertyId: invite.propertyId });
  return updated;
}

export function requestChanges(token: string) {
  const invite = getInvite(token);
  if (!invite) return null;
  const updated = { ...invite, status: "changes_requested" } as PortalInvite;
  invites.set(token, updated);
  logEvent("portal_changes", { token, propertyId: invite.propertyId });
  return updated;
}

export function listInvites() {
  return Array.from(invites.values()).map(prune);
}
