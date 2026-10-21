"use server";

import { connectDB } from "../db";
import { ContactMessage, SiteSettings } from "../models";
import { clientIp, rateLimit } from "../rate-limit";
import { contactSchema } from "../validation/schemas";
import { fail, handleError, zodFail, type ActionResult } from "./result";

/** Public contact form. Spam protection: honeypot, minimum fill time, per-IP rate limit. Messages are stored for the admin inbox. */
export async function submitContactAction(input: unknown): Promise<ActionResult> {
  try {
    const parsed = contactSchema.safeParse(input);
    if (!parsed.success) {
      if (parsed.error.issues.some((i) => i.path[0] === "company")) return { ok: true, message: "Thanks — your message was sent." };
      return zodFail(parsed.error);
    }
    const { startedAt, company: _hp, ...msg } = parsed.data;
    void _hp;
    const elapsed = Date.now() - startedAt;
    if (elapsed < 3000 || elapsed > 1000 * 60 * 60 * 6) return fail("The form expired or was sent too quickly. Reload the page and try again.");

    await connectDB();
    const settings = await SiteSettings.findOne({ key: "site" }).select("contact").lean();
    if (settings && settings.contact?.formEnabled === false) return fail("The contact form is turned off. Use one of the links on this page instead.");

    const limit = await rateLimit("contact", await clientIp(), 5, 60 * 60);
    if (!limit.ok) return fail("You've sent several messages recently. Try again in an hour.");

    await ContactMessage.create(msg);
    return { ok: true, message: "Thanks — your message was sent. I'll reply by email." };
  } catch (err) {
    return handleError(err);
  }
}
