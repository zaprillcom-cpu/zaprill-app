/**
 * Utility to normalize job titles for better indexing and autocomplete.
 * Removes noise like "Senior", "Junior", "Remote", technology stacks, etc.
 */
export function normalizeJobTitle(title: string): string {
  if (!title) return "";

  let normalized = title.toLowerCase();

  // 1. Remove common prefixes/suffixes related to seniority
  const seniorityPatterns = [
    /\b(senior|jr|sr|junior|lead|principal|staff|executive|associate|trainee|intern|internship|apprentice|entry level|mid level|level [iv]+)\b/g,
  ];

  // 2. Remove working arrangements
  const arrangementPatterns = [
    /\b(remote|hybrid|on-site|onsite|wfh|work from home|contract|freelance|part-time|full-time)\b/g,
  ];

  // 3. Remove common technical noise in parentheses or after hyphens/slashes
  // e.g. "Software Engineer - Java/Spring" -> "Software Engineer"
  const noisePatterns = [
    /\s*[-/|()].*$/g, // Remove anything after -, /, |, or inside ()
  ];

  for (const p of seniorityPatterns) {
    normalized = normalized.replace(p, "");
  }
  for (const p of arrangementPatterns) {
    normalized = normalized.replace(p, "");
  }
  for (const p of noisePatterns) {
    normalized = normalized.replace(p, "");
  }

  // Clean up extra whitespace
  normalized = normalized.replace(/\s+/g, " ").trim();

  // If we stripped everything (e.g. "Senior Remote"), return original or capitalized normalized
  if (!normalized && title) {
    normalized = title.toLowerCase().trim();
  }

  // Capitalize first letter of each word for a clean look
  return normalized
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Checks if a title is "canonical" enough (doesn't contain too much noise)
 */
export function isCanonical(title: string): boolean {
  const noiseRegex =
    /\b(remote|contract|java|python|c\+\+|aws|azure|gcp|react|vue|angular|spring|node|javascript|typescript)\b/i;
  const formattingRegex = /[-/|()]/;

  return !noiseRegex.test(title) && !formattingRegex.test(title);
}
