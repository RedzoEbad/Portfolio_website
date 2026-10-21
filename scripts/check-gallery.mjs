import mongoose from "mongoose";
import { loadEnvFile } from "node:process";

for (const f of [".env.local", ".env"]) {
  try {
    loadEnvFile(f);
  } catch {
    /* missing */
  }
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing");
  process.exit(1);
}

await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "portfolio" });
const docs = await mongoose.connection.db.collection("projects").find({}).project({ title: 1, slug: 1, gallery: 1, coverImage: 1, sections: 1 }).toArray();
for (const p of docs) {
  const shots = (p.sections || []).find((s) => s.type === "screenshots");
  console.log(
    `${p.title} | gallery=${(p.gallery || []).length} | cover=${p.coverImage?.url ? "yes" : "no"} | screenshots=${shots ? (shots.enabled ? "on" : "off") : "missing"}`,
  );
  for (const g of p.gallery || []) console.log(`  - ${g.url}`);
}
await mongoose.disconnect();
