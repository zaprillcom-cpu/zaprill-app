import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Ensures a URL has a protocol (defaults to https://).
 * Useful for external links that users might enter without 'https://'.
 */
export function ensureHttps(url: string | null | undefined): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Handle protocol-relative URLs
  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  // If it already has a protocol (e.g., http://, https://, mailto:, tel:), return as is
  if (/^([a-z0-9+.-]+):/i.test(trimmed)) {
    return trimmed;
  }

  // Otherwise, prepend https://
  return `https://${trimmed}`;
}
