/**
 * Provision (or reset) an administrator.
 *
 *   npm run admin:create                 # uses ADMIN_EMAIL + ADMIN_INITIAL_PASSWORD from .env.local
 *   npm run admin:create -- --reset      # reset that admin's password and revoke their sessions
 *
 * If ADMIN_INITIAL_PASSWORD is empty, a strong random password is generated and printed once.
 * Remove ADMIN_INITIAL_PASSWORD from your env file after running this.
 */
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { connect, disconnect } from "./_db";
import { AdminUser } from "../src/lib/models";

async function main() {
  await connect();
  const reset = process.argv.includes("--reset");
  const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error("✖ Set ADMIN_EMAIL to a valid email address in .env.local.");
    process.exit(1);
  }

  let password = process.env.ADMIN_INITIAL_PASSWORD || "";
  let generated = false;
  if (!password) {
    password = randomBytes(18).toString("base64url");
    generated = true;
  }
  if (password.length < 12) {
    console.error("✖ ADMIN_INITIAL_PASSWORD must be at least 12 characters.");
    process.exit(1);
  }

  const existing = await AdminUser.findOne({ email });
  if (existing && !reset) {
    console.log(`• An admin with ${email} already exists. Nothing changed. Use --reset to set a new password.`);
    await disconnect();
    return;
  }
  const passwordHash = await bcrypt.hash(password, 12);
  if (existing) {
    existing.passwordHash = passwordHash;
    existing.sessionVersion = (existing.sessionVersion ?? 0) + 1;
    await existing.save();
    console.log(`✔ Password reset for ${email}. All existing sessions were revoked.`);
  } else {
    await AdminUser.create({ email, passwordHash, role: "owner", name: "Owner" });
    console.log(`✔ Admin created: ${email}`);
  }
  if (generated) console.log(`\n  Generated password (shown once, store it in your password manager):\n\n    ${password}\n`);
  console.log("  Next: remove ADMIN_INITIAL_PASSWORD from your env file, then sign in at /admin/login.");
  await disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await disconnect();
  process.exit(1);
});
