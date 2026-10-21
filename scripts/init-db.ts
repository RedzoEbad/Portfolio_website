/**
 * Creates all indexes, the settings document, and (only if none exist) the eight
 * engineering-domain categories from the brief. Safe to run repeatedly.
 *
 *   npm run db:init
 */
import { connect, disconnect } from "./_db";
import { ALL_MODELS, Category, SiteSettings } from "../src/lib/models";
import { DEFAULT_DOMAINS, DEFAULT_IMPACT, DEFAULT_NAV } from "../src/lib/content/defaults";

async function main() {
  await connect();
  for (const m of ALL_MODELS) {
    await m.createCollection().catch(() => undefined);
    await m.syncIndexes();
    console.log(`✔ indexes: ${m.collection.collectionName}`);
  }
  await SiteSettings.updateOne({ key: "site" }, { $setOnInsert: { key: "site", nav: DEFAULT_NAV, impact: DEFAULT_IMPACT } }, { upsert: true });
  console.log("✔ site settings document present");

  if ((await Category.countDocuments()) === 0) {
    await Category.insertMany(DEFAULT_DOMAINS);
    console.log(`✔ created ${DEFAULT_DOMAINS.length} engineering domains (edit or delete them in /admin/categories)`);
  } else {
    console.log("• categories already exist, left unchanged");
  }
  await disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await disconnect();
  process.exit(1);
});
