import "server-only";
import { z } from "zod";
import { UnauthorizedError } from "../auth/guard";

export type ActionResult<T = undefined> =
  | { ok: true; data?: T; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export function fail(error: string, fieldErrors?: Record<string, string>): ActionResult<never> {
  return { ok: false, error, fieldErrors };
}

export function zodFail(err: z.ZodError): ActionResult<never> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of err.issues) {
    const k = issue.path.join(".");
    if (!fieldErrors[k]) fieldErrors[k] = issue.message;
  }
  const first = err.issues[0];
  return { ok: false, error: first ? `${first.path.join(".") || "Form"}: ${first.message}` : "Check the highlighted fields.", fieldErrors };
}

/** Converts thrown errors into user-facing results without leaking internals. */
export function handleError(err: unknown): ActionResult<never> {
  if (err instanceof UnauthorizedError) return fail(err.message);
  if (err instanceof z.ZodError) return zodFail(err);
  if (typeof err === "object" && err && "code" in err && (err as { code: number }).code === 11000) {
    return fail("That slug is already used by another item. Choose a different slug.", { slug: "Already in use." });
  }
  console.error("[action]", err);
  return fail("The change couldn't be saved because of a server error. Try again; if it keeps failing, check the server logs.");
}
