import "server-only";

type ContactMail = {
  to: string;
  visitorName: string;
  visitorEmail: string;
  subject: string;
  message: string;
};

/**
 * Sends a contact-form notification via Resend when RESEND_API_KEY is set.
 * Returns quietly if email isn't configured — the message is still stored in admin.
 */
export async function notifyContactEmail(mail: ContactMail): Promise<{ sent: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = mail.to.trim();
  if (!apiKey || !to) return { sent: false };

  const from = process.env.CONTACT_FROM_EMAIL?.trim() || "Portfolio Contact <onboarding@resend.dev>";
  const subject = mail.subject.trim() || `New message from ${mail.visitorName}`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: mail.visitorEmail,
        subject: `[Contact] ${subject}`,
        text: [
          `New message from your portfolio contact form.`,
          "",
          `Name: ${mail.visitorName}`,
          `Email: ${mail.visitorEmail}`,
          `Subject: ${subject}`,
          "",
          mail.message,
          "",
          "—",
          "Reply directly to this email to answer the visitor.",
        ].join("\n"),
      }),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.error("[contact-email] Resend error", res.status, body);
      return { sent: false, error: `Resend ${res.status}` };
    }
    return { sent: true };
  } catch (err) {
    console.error("[contact-email] failed", err);
    return { sent: false, error: "network" };
  }
}
