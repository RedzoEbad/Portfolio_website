import { loadEnvFile } from "node:process";
import mongoose from "mongoose";

for (const f of [".env.local", ".env"]) {
  try {
    loadEnvFile(f);
  } catch {
    /* missing */
  }
}

const to = process.env.CONTACT_TO_EMAIL?.trim() || "ebadkhan6292002@gmail.com";
const from = process.env.CONTACT_FROM_EMAIL?.trim() || "Portfolio Contact <onboarding@resend.dev>";
const key = process.env.RESEND_API_KEY?.trim();

await mongoose.connect(process.env.MONGODB_URI, { dbName: process.env.MONGODB_DB || "portfolio" });
const r = await mongoose.connection.db.collection("sitesettings").updateOne(
  { key: "site" },
  { $set: { "contact.email": to, "contact.formEnabled": true } },
);
console.log("settings email set:", to, "matched:", r.matchedCount);

if (!key) {
  console.error("RESEND_API_KEY missing");
  process.exit(1);
}

const res = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject: "[Contact] Test from portfolio",
    text: `Test message. If you received this, notifications for ${to} are working.`,
  }),
});
const body = await res.text();
console.log("Resend status:", res.status);
console.log(body.slice(0, 500));
await mongoose.disconnect();
process.exit(res.ok ? 0 : 1);
