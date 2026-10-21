import { adminTimeline } from "@/lib/queries/admin";
import { AdminHeader } from "@/components/admin/ui";
import { ProfileManager } from "@/components/admin/profile-manager";

export const metadata = { title: "Timeline" };

export default async function AdminTimeline() {
  const items = await adminTimeline();
  return (
    <>
      <AdminHeader title="Engineering timeline" description="Extra milestones for the homepage journey and About page. Published projects and certifications are included automatically — use this for lessons, roles, and other moments." />
      <ProfileManager kind="timeline" items={items} />
    </>
  );
}
