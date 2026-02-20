#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const tsx = join(__dirname, "..", "node_modules", ".bin", "tsx");
const script = join(__dirname, "..", "src", "index.ts");

execFileSync(tsx, [script], { stdio: "inherit" });
