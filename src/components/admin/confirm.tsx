"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { Button, type ButtonSize, type ButtonVariant } from "@/components/ui/button";

type Result = { ok: true; message?: string; data?: unknown } | { ok: false; error: string };

/** Runs a server action, toasts the result and refreshes server data. Optional confirmation dialog. */
export function ActionButton({
  action, children, confirm, variant = "ghost", size = "sm", onDone, ariaLabel, title,
}: {
  action: () => Promise<Result>;
  children: React.ReactNode;
  confirm?: { title: string; body: React.ReactNode; confirmLabel: string; danger?: boolean };
  variant?: ButtonVariant;
  size?: ButtonSize;
  onDone?: (r: Result) => void;
  ariaLabel?: string;
  title?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const run = () =>
    start(async () => {
      const r = await action();
      if (r.ok) {
        if (r.message) toast.success(r.message);
        setOpen(false);
        onDone?.(r);
        router.refresh();
      } else toast.error(r.error);
    });

  return (
    <>
      <Button variant={variant} size={size} disabled={pending} onClick={() => (confirm ? setOpen(true) : run())} aria-label={ariaLabel} title={title}>
        {pending && !confirm ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : children}
      </Button>
      {confirm && (
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          title={confirm.title}
          size="sm"
          footer={
            <>
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant={confirm.danger ? "danger" : "primary"} onClick={run} disabled={pending}>
                {pending && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirm.confirmLabel}
              </Button>
            </>
          }
        >
          <div className="text-sm text-fog">{confirm.body}</div>
        </Dialog>
      )}
    </>
  );
}
