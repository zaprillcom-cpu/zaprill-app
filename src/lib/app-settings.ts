/**
 * app-settings.ts
 * Typed helper to read and write admin-configurable settings from the
 * `app_settings` key-value table.
 *
 * All keys are listed in the `APP_SETTING_KEYS` constant so the rest of
 * the app can import them without magic strings.
 */

import { eq, inArray } from "drizzle-orm";
import db from "@/db";
import { appSettings } from "@/db/schema";

// ─────────────────────────────────────────────────
// Keys
// ─────────────────────────────────────────────────

export const APP_SETTING_KEYS = [
  "company_name",
  "company_gstin",
  "company_address",
  "company_cin",
  "company_email",
] as const;

export type AppSettingKey = (typeof APP_SETTING_KEYS)[number];

export interface CompanySettings {
  company_name: string;
  company_gstin: string;
  company_address: string;
  company_cin: string;
  company_email: string;
}

// ─────────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────────

/** Returns all company settings as a typed object. Missing keys default to "". */
export async function getCompanySettings(): Promise<CompanySettings> {
  const rows = await db
    .select()
    .from(appSettings)
    .where(inArray(appSettings.key, [...APP_SETTING_KEYS]));

  const map: Record<string, string> = {};
  for (const row of rows) map[row.key] = row.value;

  return {
    company_name: map.company_name ?? "Zaprill",
    company_gstin: map.company_gstin ?? "",
    company_address: map.company_address ?? "",
    company_cin: map.company_cin ?? "",
    company_email: map.company_email ?? "billing@zaprill.com",
  };
}

/** Get a single setting value. Returns `""` if not found. */
export async function getSettingValue(key: AppSettingKey): Promise<string> {
  const [row] = await db
    .select({ value: appSettings.value })
    .from(appSettings)
    .where(eq(appSettings.key, key))
    .limit(1);
  return row?.value ?? "";
}

// ─────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────

/** Upsert a single setting. */
export async function setSettingValue(
  key: AppSettingKey,
  value: string,
): Promise<void> {
  await db
    .insert(appSettings)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: appSettings.key,
      set: { value, updatedAt: new Date() },
    });
}

/** Upsert multiple company settings at once. */
export async function saveCompanySettings(
  settings: Partial<CompanySettings>,
): Promise<void> {
  const entries = Object.entries(settings) as [AppSettingKey, string][];
  for (const [key, value] of entries) {
    await setSettingValue(key, value ?? "");
  }
}
