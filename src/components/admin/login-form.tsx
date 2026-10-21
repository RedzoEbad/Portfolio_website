"use client";

import { useActionState, useState } from "react";
import { Loader2 } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, null);
  // React resets uncontrolled fields after a form action; keep the email so a typo'd password is quick to retry.
  const [email, setEmail] = useState("");
  return (
    <form action={action} className="glass space-y-5 rounded-2xl p-6">
      <input type="hidden" name="next" value={next ?? ""} />
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state && !state.ok && (
        <p role="alert" className="rounded-lg border border-flare/40 bg-flare/10 px-3 py-2 text-sm text-flare">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
