import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connectDB } from "../db";
import { AdminUser } from "../models";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export type AdminIdentity = { id: string; email: string; name: string; role: "owner" | "editor" };

/**
 * Full server-side check: valid signature + expiry, user still exists,
 * and the session version matches (so "sign out everywhere" revokes tokens).
 */
export const getAdmin = cache(async (): Promise<AdminIdentity | null> => {
  const jar = await cookies();
  const session = await verifySessionToken(jar.get(SESSION_COOKIE)?.value);
  if (!session) return null;
  await connectDB();
  const user = await AdminUser.findById(session.sub).lean();
  if (!user || (user.sessionVersion ?? 0) !== session.sv) return null;
  return { id: String(user._id), email: user.email, name: user.name ?? "Administrator", role: user.role as AdminIdentity["role"] };
});

/** For admin pages: redirects to the login screen. */
export async function requireAdminPage(): Promise<AdminIdentity> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export class UnauthorizedError extends Error {
  constructor(message = "You need to sign in again to do that.") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/** For Server Actions and Route Handlers: throws instead of redirecting. */
export async function requireAdmin(opts: { role?: "owner" } = {}): Promise<AdminIdentity> {
  const admin = await getAdmin();
  if (!admin) throw new UnauthorizedError();
  if (opts.role === "owner" && admin.role !== "owner") throw new UnauthorizedError("Only the site owner can do that.");
  return admin;
}
