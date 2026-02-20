#!/usr/bin/env tsx
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { checkbox } from "@inquirer/prompts";

const PKG_PATH = resolve("package.json");

/** Run pnpm install and capture warning about ignored build scripts */
function getIgnoredPackages(): string[] {
  try {
    const output = execSync("pnpm install 2>&1", { encoding: "utf-8" });
    const match = output.match(/Ignored build scripts:\s*(.+)\./);
    if (!match) return [];
    return match[1].split(",").map((s) => s.replace(/@[\d.]+$/, "").trim());
  } catch {
    return [];
  }
}

/** Read package.json and return parsed content */
function readPkg(): { content: string; json: Record<string, unknown> } {
  const content = readFileSync(PKG_PATH, "utf-8");
  return { content, json: JSON.parse(content) };
}

/** Detect indent from package.json */
function detectIndent(content: string): string {
  const match = content.match(/^(\s+)"/m);
  return match?.[1] ?? "  ";
}

/** Get currently approved packages from package.json */
function getApproved(json: Record<string, unknown>): string[] {
  const pnpm = json.pnpm as Record<string, unknown> | undefined;
  return (pnpm?.onlyBuiltDependencies as string[]) ?? [];
}

/** Write approved packages to package.json */
function writeApproved(packages: string[]) {
  const { content, json } = readPkg();
  const indent = detectIndent(content);
  const pnpm = (json.pnpm ?? {}) as Record<string, unknown>;
  pnpm.onlyBuiltDependencies = [...new Set(packages)].sort();
  json.pnpm = pnpm;
  writeFileSync(PKG_PATH, JSON.stringify(json, null, indent) + "\n");
}

async function main() {
  console.log("Checking for packages with build scripts...\n");

  const ignored = getIgnoredPackages();
  const approved = getApproved(readPkg().json);

  if (!ignored.length) {
    console.log("All build scripts are approved. Nothing to do.");
    return;
  }

  console.log(`Found ${ignored.length} package(s) awaiting approval:\n`);

  const selected = await checkbox({
    message: "Select packages to approve:",
    choices: ignored.map((pkg) => ({
      name: pkg,
      value: pkg,
      checked: true,
    })),
  });

  if (!selected.length) {
    console.log("\nNo packages selected.");
    return;
  }

  const merged = [...new Set([...approved, ...selected])].sort();
  writeApproved(merged);

  console.log(`\nApproved ${selected.length} package(s) in package.json:`);
  selected.forEach((pkg) => console.log(`  + ${pkg}`));

  console.log("\nRunning pnpm install...\n");
  execSync("pnpm install", { stdio: "inherit" });
}

main().catch(console.error);
