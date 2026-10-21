import { adminTimeline } from "@/lib/queries/admin";
import { AdminHeader } from "@/components/admin/ui";
import { ProfileManager } from "@/components/admin/profile-manager";

export const metadata = { title: "Timeline" };

export default async function AdminTimeline() {
  const items = await adminTimeline();
  return (
    <>
      <AdminHeader title="Engineering timeline" description="Milestones shown on the homepage journey and the About page, newest first. Only add things that really happened." />
      <ProfileManager kind="timeline" items={items} />
    </>
  );
}
