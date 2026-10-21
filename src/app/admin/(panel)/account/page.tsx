import { requireAdminPage } from "@/lib/auth/guard";
import { AdminHeader, Panel } from "@/components/admin/ui";
import { PasswordForm, SignOutEverywhere } from "@/components/admin/account-forms";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const admin = await requireAdminPage();
  return (
    <>
      <AdminHeader title="Account" description={`Signed in as ${admin.email} (${admin.role}).`} />
      <div className="space-y-6">
        <Panel title="Change password" description="Changing your password signs out every other session.">
          <PasswordForm />
        </Panel>
        <Panel title="Sessions" description="Revoke every active session, including this one. Use this if a device was lost.">
          <SignOutEverywhere />
        </Panel>
        <Panel title="Adding or recovering admins">
          <p className="text-sm text-fog">
            Admin accounts are provisioned from the command line, never from the website. Run <code className="rounded bg-hull-2 px-1.5 py-0.5 font-mono text-xs">npm run admin:create</code> with ADMIN_EMAIL set, or add <code className="rounded bg-hull-2 px-1.5 py-0.5 font-mono text-xs">-- --reset</code> to reset a password. See the README.
          </p>
        </Panel>
      </div>
    </>
  );
}
