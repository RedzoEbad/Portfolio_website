"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { connectDB } from "../db";
import { AdminUser } from "../models";
import { clearSessionCookie, setSessionCookie, signSession } from "../auth/session";
import { requireAdmin } from "../auth/guard";
import { clearRateLimit, clientIp, rateLimit } from "../rate-limit";
import { loginSchema, passwordChangeSchema } from "../validation/schemas";
import { fail, handleError, type ActionResult } from "./result";

// Compared against when the email doesn't exist, so response time doesn't reveal valid emails.
const DUMMY_HASH = "$2b$12$eSWI0wuez2eBzc09LRa8Qu3yTCYJ2toqFGuyVVK6GgC4deTlpgUCy";

export async function loginAction(_prev: ActionResult | null, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return fail("Enter your email and password.");
  const { email, password } = parsed.data;
  const ip = await clientIp();

  try {
    const [byIp, byEmail] = await Promise.all([rateLimit("login-ip", ip, 20, 15 * 60), rateLimit("login-email", email.toLowerCase(), 5, 15 * 60)]);
    if (!byIp.ok || !byEmail.ok) {
      const wait = Math.ceil(Math.max(byIp.retryAfter, byEmail.retryAfter) / 60);
      return fail(`Too many sign-in attempts. Try again in ${wait} minute${wait === 1 ? "" : "s"}.`);
    }

    await connectDB();
    const user = await AdminUser.findOne({ email: email.toLowerCase() }).select("+passwordHash");
    const valid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH);
    if (!user || !valid) return fail("That email and password don't match an admin account.");

    user.lastLoginAt = new Date();
    await user.save();
    await clearRateLimit(byEmail.key);
    const token = await signSession({ sub: String(user._id), role: user.role as "owner" | "editor", sv: user.sessionVersion ?? 0 });
    await setSessionCookie(token);
  } catch (err) {
    return handleError(err);
  }
  const next = String(formData.get("next") || "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/admin/login");
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    const data = passwordChangeSchema.parse(input);
    await connectDB();
    const user = await AdminUser.findById(admin.id).select("+passwordHash");
    if (!user || !(await bcrypt.compare(data.current, user.passwordHash))) return fail("Your current password is incorrect.", { current: "Incorrect password." });
    user.passwordHash = await bcrypt.hash(data.next, 12);
    user.sessionVersion = (user.sessionVersion ?? 0) + 1;
    await user.save();
    // Re-issue a session for this browser; every other session is now invalid.
    await setSessionCookie(await signSession({ sub: String(user._id), role: user.role as "owner" | "editor", sv: user.sessionVersion }));
    return { ok: true, message: "Password changed. Other sessions were signed out." };
  } catch (err) {
    return handleError(err);
  }
}

export async function signOutEverywhereAction(): Promise<ActionResult> {
  try {
    const admin = await requireAdmin();
    await connectDB();
    await AdminUser.updateOne({ _id: admin.id }, { $inc: { sessionVersion: 1 } });
  } catch (err) {
    return handleError(err);
  }
  await clearSessionCookie();
  redirect("/admin/login");
}
