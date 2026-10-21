import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth/guard";
import { LoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getAdmin().catch(() => null)) redirect("/admin");
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden px-4">
      <div className="bg-grid mask-fade pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="pointer-events-none absolute top-[-20%] left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,var(--glow-signal),transparent)]" aria-hidden="true" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8">
          <p className="font-mono text-sm text-fog">
            <span className="text-signal">$</span> ssh admin@portfolio
          </p>
          <h1 className="mt-3 text-3xl tracking-tight">Sign in to the admin portal</h1>
          <p className="mt-2 text-sm text-fog">Only provisioned administrators can sign in. There is no public registration.</p>
        </div>
        <LoginForm next={next} />
      </div>
    </main>
  );
}
