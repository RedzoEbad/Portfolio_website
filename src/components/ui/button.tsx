import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-signal text-signal-ink hover:brightness-110 shadow-[0_0_0_1px_color-mix(in_srgb,var(--signal)_60%,transparent),0_8px_30px_-8px_var(--glow-signal)]",
  secondary: "bg-hull-2 text-frost border border-line-strong hover:border-signal/60",
  ghost: "text-fog hover:text-frost hover:bg-hull-2",
  danger: "bg-flare/15 text-flare border border-flare/40 hover:bg-flare/25",
  outline: "border border-line-strong text-frost hover:border-signal hover:text-signal",
} as const;
const sizes = { sm: "h-8 px-3 text-sm gap-1.5", md: "h-10 px-4 text-sm gap-2", lg: "h-12 px-6 text-base gap-2.5", icon: "h-9 w-9" } as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center rounded-lg font-medium whitespace-nowrap transition-[background,color,border-color,filter,transform] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none",
    variants[variant],
    sizes[size],
    className,
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize };

export const Button = forwardRef<HTMLButtonElement, Props>(function Button({ variant = "primary", size = "md", className, type = "button", ...props }, ref) {
  return <button ref={ref} type={type} className={buttonClass(variant, size, className)} {...props} />;
});
