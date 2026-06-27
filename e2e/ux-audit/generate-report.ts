import fs from "node:fs";
import path from "node:path";

interface UxFinding {
  severity: "P0" | "P1" | "P2";
  route: string;
  title: string;
  description: string;
  heuristic?: string;
  viewport?: string;
}

const REPORT_DIR = path.join(process.cwd(), "ux-audit/report");
const FINDINGS_FILE = path.join(REPORT_DIR, "findings.json");
const OUTPUT = path.join(REPORT_DIR, "UX_AUDIT_REPORT.md");

function main() {
  if (!fs.existsSync(FINDINGS_FILE)) {
    console.error("No findings.json — run `pnpm test:e2e:ux` first.");
    process.exit(1);
  }

  const findings: UxFinding[] = JSON.parse(
    fs.readFileSync(FINDINGS_FILE, "utf8"),
  );

  const bySeverity = {
    P0: findings.filter((f) => f.severity === "P0"),
    P1: findings.filter((f) => f.severity === "P1"),
    P2: findings.filter((f) => f.severity === "P2"),
  };

  const screenshots = fs.existsSync(path.join(REPORT_DIR, "screenshots"))
    ? fs.readdirSync(path.join(REPORT_DIR, "screenshots"))
    : [];

  const lines: string[] = [
    "# UX Audit Report — AI Job God (Zaprill)",
    "",
    `Generated: ${new Date().toISOString()}`,
    "",
    "## Executive Summary",
    "",
    `- **P0 (blocks core tasks):** ${bySeverity.P0.length}`,
    `- **P1 (confusing but workable):** ${bySeverity.P1.length}`,
    `- **P2 (polish / consistency):** ${bySeverity.P2.length}`,
    "",
  ];

  if (bySeverity.P0.length > 0) {
    lines.push("### Top blockers for new users", "");
    for (const f of bySeverity.P0.slice(0, 5)) {
      lines.push(`- **${f.title}** (${f.route}) — ${f.description}`);
    }
    lines.push("");
  }

  for (const severity of ["P0", "P1", "P2"] as const) {
    const group = bySeverity[severity];
    if (group.length === 0) continue;

    lines.push(`## ${severity} Findings`, "");
    for (const f of group) {
      lines.push(`### ${f.title}`, "");
      lines.push(`- **Route:** \`${f.route}\``);
      if (f.viewport) lines.push(`- **Viewport:** ${f.viewport}`);
      if (f.heuristic) lines.push(`- **Heuristic:** ${f.heuristic}`);
      lines.push(`- **Detail:** ${f.description}`, "");
    }
  }

  if (screenshots.length > 0) {
    lines.push("## Screenshots", "");
    for (const file of screenshots.sort()) {
      lines.push(`- \`screenshots/${file}\``);
    }
    lines.push("");
  }

  lines.push(
    "## Recommended IA (high level)",
    "",
    "1. Add persistent app shell (sidebar or bottom nav) with: **Analyze**, **Jobs**, **Resumes**, **History**",
    "2. Rename **Insights** → **History** (or vice versa) for label consistency",
    "3. Put **Analyze** in primary nav — it's the core product action",
    "4. Mobile: add hamburger or bottom tab bar; don't bury features only in avatar menu",
    "5. Dashboard: one hero CTA — **Start new analysis** — above the fold",
    "",
  );

  fs.writeFileSync(OUTPUT, lines.join("\n"));
  console.log(`Report written to ${OUTPUT}`);
}

main();
