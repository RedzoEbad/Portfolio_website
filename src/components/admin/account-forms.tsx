"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { passwordChangeSchema } from "@/lib/validation/schemas";
import { changePasswordAction, signOutEverywhereAction } from "@/lib/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function PasswordForm() {
  const [pending, start] = useTransition();
  const { register, handleSubmit, formState, reset, setError } = useForm<z.input<typeof passwordChangeSchema>>({ resolver: zodResolver(passwordChangeSchema), defaultValues: { current: "", next: "", confirm: "" } });
  const e = formState.errors;
  return (
    <form
      noValidate
      onSubmit={handleSubmit((v) =>
        start(async () => {
          const r = await changePasswordAction(v);
          if (!r.ok) {
            Object.entries(r.fieldErrors ?? {}).forEach(([k, m]) => setError(k as "current", { message: m }));
            return void toast.error(r.error);
          }
          toast.success(r.message);
          reset();
        }),
      )}
      className="max-w-md space-y-4"
    >
      <Field label="Current password" htmlFor="pw-current" error={e.current?.message}>
        <Input id="pw-current" type="password" autoComplete="current-password" {...register("current")} />
      </Field>
      <Field label="New password" htmlFor="pw-next" error={e.next?.message} hint="At least 12 characters. A passphrase from your password manager is ideal.">
        <Input id="pw-next" type="password" autoComplete="new-password" {...register("next")} />
      </Field>
      <Field label="Confirm new password" htmlFor="pw-confirm" error={e.confirm?.message}>
        <Input id="pw-confirm" type="password" autoComplete="new-password" {...register("confirm")} />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="h-4 w-4 animate-spin" />}
        Change password
      </Button>
    </form>
  );
}

export function SignOutEverywhere() {
  const [pending, start] = useTransition();
  return (
    <Button
      variant="danger"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await signOutEverywhereAction();
          if (r && !r.ok) toast.error(r.error);
        })
      }
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      Sign out of all sessions
    </Button>
  );
}
