import type { Metadata } from "next";
import { getSettings } from "@/lib/queries/public";
import { ContactSection } from "@/components/site/contact-section";

export const revalidate = 120;
export const metadata: Metadata = { title: "Contact", description: "Get in touch about roles, projects or infrastructure problems.", alternates: { canonical: "/contact" } };

export default async function ContactPage() {
  const settings = await getSettings();
  return (
    <div className="pt-16">
      <ContactSection settings={settings} headingLevel={1} />
    </div>
  );
}
