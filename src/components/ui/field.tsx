import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const controlClass =
  "w-full rounded-lg border border-line-strong bg-abyss/60 px-3 py-2 text-sm text-frost placeholder:text-fog/70 transition-colors focus:border-signal focus:outline-none focus-visible:outline-none focus:ring-2 focus:ring-signal/25 aria-[invalid=true]:border-flare disabled:opacity-60";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className, ...p }, ref) {
  return <input ref={ref} className={cn(controlClass, "h-10", className)} {...p} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea({ className, ...p }, ref) {
  return <textarea ref={ref} className={cn(controlClass, "min-h-24 leading-relaxed", className)} {...p} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select({ className, ...p }, ref) {
  return <select ref={ref} className={cn(controlClass, "h-10 appearance-none bg-[length:12px] bg-[right_12px_center] bg-no-repeat pr-8", className)} style={{ backgroundImage: "linear-gradient(45deg,transparent 50%,var(--fog) 50%),linear-gradient(135deg,var(--fog) 50%,transparent 50%)", backgroundPosition: "calc(100% - 16px) 55%, calc(100% - 11px) 55%", backgroundSize: "5px 5px" }} {...p} />;
});

export function Field({ label, htmlFor, hint, error, children, className }: { label: string; htmlFor?: string; hint?: ReactNode; error?: string; children: ReactNode; className?: string }) {
  const hintId = htmlFor ? `${htmlFor}-hint` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-frost">
        {label}
      </label>
      {children}
      {error ? (
        <p id={hintId} role="alert" className="text-xs text-flare">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-fog">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function Switch({ checked, onChange, label, description, id, hideLabel }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string; id?: string; hideLabel?: boolean }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative mt-0.5 h-5 w-9 shrink-0 rounded-full border transition-colors", checked ? "border-signal bg-signal/80" : "border-line-strong bg-hull-2")}
      >
        <span className={cn("absolute top-0.5 left-0.5 h-3.5 w-3.5 rounded-full bg-frost shadow transition-transform", checked && "translate-x-4 bg-signal-ink")} />
      </button>
      <span>
        <span className={hideLabel ? "sr-only" : "block text-sm font-medium text-frost"}>{label}</span>
        {description && <span className="block text-xs text-fog">{description}</span>}
      </span>
    </label>
  );
}
