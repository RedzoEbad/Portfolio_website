import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/auth/guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { connectDB } from "@/lib/db";
import { ContactMessage, SiteSettings } from "@/lib/models";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  await connectDB();
  const [unread, settings] = await Promise.all([ContactMessage.countDocuments({ read: false }), SiteSettings.findOne({ key: "site" }).select("siteName").lean()]);
  return (
    <AdminShell email={admin.email} siteName={settings?.siteName || "Portfolio"} unread={unread}>
      {children}
    </AdminShell>
  );
}
