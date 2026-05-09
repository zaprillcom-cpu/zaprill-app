import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

import { nanoid } from "nanoid";
import { jobTitleAliases, jobTitles } from "@/db/schema";
import { normalizeJobTitle } from "@/lib/title-normalizer";

const TITLES_URL =
  "https://raw.githubusercontent.com/jneidel/job-titles/master/job-titles.json";

async function seed() {
  const db = (await import("@/db")).default;
  console.log("Fetching job titles from source...");
  const response = await fetch(TITLES_URL);
  const data = await response.json();
  const rawTitles: string[] = data["job-titles"];

  console.log(`Found ${rawTitles.length} raw titles. Processing...`);

  // Map of normalized title -> Set of raw aliases
  const canonicalMap = new Map<string, Set<string>>();

  for (const raw of rawTitles) {
    const normalized = normalizeJobTitle(raw);
    if (!normalized) continue;

    if (!canonicalMap.has(normalized)) {
      canonicalMap.set(normalized, new Set());
    }

    // Only add as alias if it's different from the normalized canonical title
    if (raw.toLowerCase() !== normalized.toLowerCase()) {
      canonicalMap.get(normalized)!.add(raw);
    }
  }

  console.log(`Normalized into ${canonicalMap.size} canonical titles.`);

  const canonicalEntries = Array.from(canonicalMap.entries());
  const BATCH_SIZE = 500;

  for (let i = 0; i < canonicalEntries.length; i += BATCH_SIZE) {
    const batch = canonicalEntries.slice(i, i + BATCH_SIZE);

    console.log(
      `Seeding batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(canonicalEntries.length / BATCH_SIZE)}...`,
    );

    try {
      for (const [title, aliases] of batch) {
        const titleId = nanoid();
        const slug = title.toLowerCase().replace(/\s+/g, "-");

        // Insert canonical title
        // biome-ignore lint: Intentional batching
        await db
          .insert(jobTitles)
          .values({
            id: titleId,
            title: title,
            slug: slug,
            source: "onet_derived",
            popularityScore: 1, // Default popularity
          })
          .onConflictDoNothing();

        // If we have aliases, insert them
        if (aliases.size > 0) {
          const aliasValues = Array.from(aliases).map((a) => ({
            id: nanoid(),
            jobTitleId: titleId,
            alias: a,
          }));

          // Sub-batching aliases to avoid query parameter limits
          for (let j = 0; j < aliasValues.length; j += 100) {
            // biome-ignore lint: Intentional sub-batching
            await db
              .insert(jobTitleAliases)
              .values(aliasValues.slice(j, j + 100))
              .onConflictDoNothing();
          }
        }
      }
    } catch (error) {
      console.error(`Error seeding batch starting at index ${i}:`, error);
    }
  }

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
