import { adminSkills } from "@/lib/queries/admin";
import { AdminHeader } from "@/components/admin/ui";
import { ProfileManager } from "@/components/admin/profile-manager";

export const metadata = { title: "Skills" };

export default async function AdminSkills() {
  const items = await adminSkills();
  return (
    <>
      <AdminHeader title="Skills and technologies" description="Grouped on the About page. No proficiency percentages: just the tools, grouped the way you think about them." />
      <ProfileManager kind="skill" items={items} />
    </>
  );
}
