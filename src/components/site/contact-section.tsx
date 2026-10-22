import type { SettingsDTO } from "@/lib/content/types";
import { Reveal } from "@/components/motion/primitives";
import { Container } from "./section-header";
import { SocialLinks, socialItems } from "./social-links";
import { ContactForm } from "./contact-form";

export function ContactSection({ settings, headingLevel = 2 }: { settings: SettingsDTO; headingLevel?: 1 | 2 }) {
  const H = headingLevel === 1 ? "h1" : "h2";
  const hasLinks = socialItems(settings).length > 0;
  return (
    <section id="contact" className="scroll-mt-24 border-t border-line py-16 sm:py-24 md:py-32" aria-labelledby="contact-title">
      <Container wide>
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8 xl:gap-16">
          <Reveal variant="rise" className="lg:col-span-5">
            <p className="mb-3 font-mono text-[11px] tracking-[0.22em] text-signal uppercase">07 — Contact</p>
            <H id="contact-title" className="text-[clamp(2rem,4.5vw,3.6rem)] leading-[1.02] tracking-tight" style={{ fontVariationSettings: '"opsz" 72' }}>
              Let&apos;s talk systems
            </H>
            <p className="mt-5 max-w-md text-base leading-relaxed text-fog sm:text-lg">
              {settings.contact.note || "Have a role, a project, or a gnarly infrastructure problem? Send a message — I’ll reply by email."}
            </p>
            {hasLinks && (
              <div className="mt-10">
                <p className="mb-4 font-mono text-[11px] tracking-wider text-fog uppercase">Reach me</p>
                <SocialLinks settings={settings} withLabels />
              </div>
            )}
            {settings.location && <p className="mt-8 text-sm text-fog">Based in {settings.location}</p>}
          </Reveal>

          <Reveal variant="blur" delay={0.1} className="lg:col-span-7">
            <div className="rounded-[1.5rem] border border-line bg-hull/40 p-5 sm:p-8 lg:p-10">
              {settings.contact.formEnabled ? (
                <ContactForm />
              ) : (
                <p className="text-fog">{hasLinks ? "The contact form is off. Reach me through the links on this page." : "Contact details haven't been published yet."}</p>
              )}
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
