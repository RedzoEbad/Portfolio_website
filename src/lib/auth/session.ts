import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { env } from "../env";

export const SESSION_COOKIE = "pf_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

export type SessionPayload = { sub: string; role: "owner" | "editor"; sv: number };

function key() {
  return new TextEncoder().encode(env.authSecret);
}

export async function signSession(payload: SessionPayload) {
  return new SignJWT({ role: payload.role, sv: payload.sv })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setIssuer("portfolio-admin")
    .setAudience("portfolio-admin")
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key());
}

export async function verifySessionToken(token?: string | null): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { issuer: "portfolio-admin", audience: "portfolio-admin", algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return { sub: payload.sub, role: (payload.role as SessionPayload["role"]) ?? "editor", sv: Number(payload.sv ?? 0) };
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: env.isProd,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
