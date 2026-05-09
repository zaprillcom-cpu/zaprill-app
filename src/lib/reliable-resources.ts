import { eq } from "drizzle-orm";
import db from "@/db";
import { learningResources } from "@/db/schema";
import type { LearningResource, SkillCategory } from "@/types";

/**
 * Enhances a learning resource with reliable links or search fallbacks.
 */
export async function enhanceRoadmapResource(
  resource: LearningResource,
  skillName: string,
): Promise<LearningResource> {
  const normalizedSkill = skillName.toLowerCase().trim();

  try {
    // 1. Check database for predefined reliable/affiliate resources for this skill & type
    const dbResources = await db
      .select()
      .from(learningResources)
      .where(eq(learningResources.skill, normalizedSkill));

    const activeResources = dbResources.filter((r) => r.isActive);

    // Prefer exact type match, or fallback to any predefined resource for that skill
    const bestMatch =
      activeResources.find((r) => r.type === resource.type) ||
      activeResources[0];

    if (bestMatch) {
      // If we found a predefined resource, format its URL through our tracking endpoint
      const trackingUrl = `/api/r?id=${bestMatch.id}`;
      return {
        ...resource,
        url: trackingUrl,
        name: bestMatch.name, // override LLM name with our structured name
      };
    }
  } catch (error) {
    console.error("[ENHANCE_RESOURCE_ERROR]", error);
  }

  // 2. If the URL is missing or looks hallucinated (doesn't start with http/https)
  if (!resource.url || !resource.url.startsWith("http")) {
    const query = encodeURIComponent(`learn ${skillName} ${resource.type}`);
    return {
      ...resource,
      url: `https://www.google.com/search?q=${query}`,
      name: `${resource.name} (Search Result)`,
    };
  }

  // 3. Fallback for common high-authority sites that might have changed paths
  // If the LLM generates a dead-looking Udemy or Coursera link, we can sometimes normalize it,
  // but for now, we'll trust it if it looks valid, or the prompt will fix it.

  return resource;
}
