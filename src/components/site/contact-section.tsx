import type { SettingsDTO } from "@/lib/content/types";
import { Container } from "./section-header";
import { SocialLinks, socialItems } from "./social-links";
import { ContactForm } from "./contact-form";

export function ContactSection({ settings, headingLevel = 2 }: { settings: SettingsDTO; headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? "h1" : "h2";
  const hasLinks = socialItems(settings).length > 0;
  return (
    <section id="contact" className="scroll-mt-24 py-20 md:py-28" aria-labelledby="contact-title">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-line bg-hull/50 p-6 sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[radial-gradient(closest-side,var(--glow-signal),transparent)]" aria-hidden="true" />
          <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <H id="contact-title" className="text-3xl tracking-tight md:text-4xl" style={{ fontVariationSettings: '"opsz" 72' }}>
                Let&apos;s talk infrastructure
              </H>
              <p className="mt-4 max-w-md text-lg text-fog">{settings.contact.note || "Have a role, a project, or a gnarly system problem? Send a message and I'll get back to you."}</p>
              {hasLinks && (
                <div className="mt-8">
                  <p className="mb-3 text-sm text-fog">Elsewhere</p>
                  <SocialLinks settings={settings} withLabels />
                </div>
              )}
              {settings.location && <p className="mt-8 text-sm text-fog">Based in {settings.location}</p>}
            </div>
            <div>
              {settings.contact.formEnabled ? (
                <ContactForm />
              ) : (
                <p className="rounded-xl border border-line p-6 text-fog">{hasLinks ? "The contact form is off. Reach me through the links on this page." : "Contact details haven't been published yet."}</p>
              )}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
