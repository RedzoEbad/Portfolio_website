import { adminCertifications } from "@/lib/queries/admin";
import { AdminHeader } from "@/components/admin/ui";
import { ProfileManager } from "@/components/admin/profile-manager";
import { env } from "@/lib/env";

export const metadata = { title: "Certifications" };

export default async function AdminCertifications() {
  const items = await adminCertifications();
  return (
    <>
      <AdminHeader title="Certifications and achievements" description="Shown on the About page and in Engineering journey on the homepage. Add a verification URL so visitors can confirm each one." />
      <ProfileManager kind="certification" items={items} uploadsEnabled={!!env.cloudinary} />
    </>
  );
}
