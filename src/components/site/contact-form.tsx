"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { contactSchema, type ContactInput } from "@/lib/validation/schemas";
import { submitContactAction } from "@/lib/actions/public";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";

export function ContactForm() {
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const { register, handleSubmit, formState, reset, setError, setValue } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "", company: "", startedAt: Date.now() },
  });
  const e = formState.errors;

  if (status?.ok) {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-[#2dd4bf]/40 bg-[#2dd4bf]/10 p-5">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#2dd4bf]" aria-hidden="true" />
        <div>
          <p className="font-medium">{status.message}</p>
          <button
            type="button"
            className="mt-2 text-sm text-fog underline underline-offset-4 hover:text-frost"
            onClick={() => {
              reset({ name: "", email: "", subject: "", message: "", company: "", startedAt: Date.now() });
              setStatus(null);
            }}
          >
            Send another message
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onFocusCapture={() => {
        // Refresh anti-bot timer on first interaction so long-open tabs still work.
        if (!formState.isDirty) setValue("startedAt", Date.now(), { shouldDirty: false });
      }}
      onSubmit={handleSubmit(async (values) => {
        setStatus(null);
        try {
          const res = await submitContactAction(values);
          if (res.ok) setStatus({ ok: true, message: res.message ?? "Message sent." });
          else {
            Object.entries(res.fieldErrors ?? {}).forEach(([k, msg]) => setError(k as keyof ContactInput, { message: msg }));
            setStatus({ ok: false, message: res.error || "Could not send. Please try again." });
          }
        } catch {
          setStatus({
            ok: false,
            message: "Could not reach the server. Refresh the page and try again.",
          });
        }
      })}
      className="space-y-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name" error={e.name?.message}>
          <Input id="c-name" autoComplete="name" aria-invalid={!!e.name} {...register("name")} />
        </Field>
        <Field label="Email" htmlFor="c-email" error={e.email?.message}>
          <Input id="c-email" type="email" autoComplete="email" aria-invalid={!!e.email} {...register("email")} />
        </Field>
      </div>
      <Field label="Subject (optional)" htmlFor="c-subject" error={e.subject?.message}>
        <Input id="c-subject" {...register("subject")} />
      </Field>
      <Field label="Message" htmlFor="c-message" error={e.message?.message}>
        <Textarea id="c-message" rows={6} aria-invalid={!!e.message} {...register("message")} />
      </Field>
      {/* Honeypot, hidden from people and assistive tech */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="c-company">Company</label>
        <input id="c-company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>
      <input type="hidden" {...register("startedAt", { valueAsNumber: true })} />
      {status && !status.ok && (
        <p role="alert" className="rounded-lg border border-flare/40 bg-flare/10 px-3 py-2 text-sm text-flare">
          {status.message}
        </p>
      )}
      <Button type="submit" size="lg" disabled={formState.isSubmitting}>
        {formState.isSubmitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {formState.isSubmitting ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
