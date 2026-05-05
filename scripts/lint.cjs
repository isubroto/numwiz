"use strict";

const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const packageJson = require(path.join(rootDir, "package.json"));

const requiredScripts = [
  "typecheck",
  "lint",
  "format",
  "test",
  "coverage",
  "build",
  "bench",
  "package:validate",
];

const forbiddenText = [
  "@subrotosaha/datekit",
  "datekit",
];

const scanRoots = [
  ".github",
  "README.md",
  "docs",
  "benchmark/README.md",
];

function fail(message) {
  console.error(`lint: ${message}`);
  process.exitCode = 1;
}

function walk(entry) {
  const abs = path.join(rootDir, entry);
  if (!fs.existsSync(abs)) return [];
  const stat = fs.statSync(abs);
  if (stat.isFile()) return [abs];
  const files = [];
  for (const child of fs.readdirSync(abs)) {
    const childAbs = path.join(abs, child);
    const childStat = fs.statSync(childAbs);
    if (childStat.isDirectory()) files.push(...walk(path.relative(rootDir, childAbs)));
    else files.push(childAbs);
  }
  return files;
}

if (packageJson.name !== "numwiz") {
  fail(`package name must be "numwiz", received "${packageJson.name}"`);
}

if (packageJson.sideEffects !== false) {
  fail("package.json must declare sideEffects: false for tree-shaking metadata");
}

for (const script of requiredScripts) {
  if (!packageJson.scripts || !packageJson.scripts[script]) {
    fail(`missing npm script "${script}"`);
  }
}

for (const [subpath, target] of Object.entries(packageJson.exports || {})) {
  if (subpath === "./package.json") continue;
  for (const condition of ["types", "import", "require", "default"]) {
    if (!target[condition]) {
      fail(`export "${subpath}" is missing condition "${condition}"`);
    }
  }
}

for (const file of scanRoots.flatMap(walk)) {
  const rel = path.relative(rootDir, file).replaceAll(path.sep, "/");
  if (!/\.(md|ya?ml|json|ts|js|cjs)$/.test(rel)) continue;
  const text = fs.readFileSync(file, "utf8");
  for (const forbidden of forbiddenText) {
    if (text.includes(forbidden)) {
      fail(`${rel} contains copied package text "${forbidden}"`);
    }
  }
}

if (process.exitCode) process.exit(process.exitCode);
console.log("lint: package metadata, exports, scripts, and docs references look good");
