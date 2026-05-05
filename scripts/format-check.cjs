"use strict";

const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const allowedExtensions = new Set([
  ".cjs",
  ".js",
  ".json",
  ".md",
  ".ts",
  ".yaml",
  ".yml",
]);
const ignoredDirectories = new Set([
  ".git",
  "coverage",
  "dist",
  "node_modules",
]);
const ignoredFiles = new Set([
  "package-lock.json",
  "benchmark/results.json",
  "benchmark/RESULTS.md",
]);

const problems = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!ignoredDirectories.has(entry.name)) walk(path.join(dir, entry.name));
      continue;
    }

    const abs = path.join(dir, entry.name);
    const rel = path.relative(rootDir, abs).replaceAll(path.sep, "/");
    if (ignoredFiles.has(rel)) continue;
    if (!allowedExtensions.has(path.extname(entry.name))) continue;

    const text = fs.readFileSync(abs, "utf8");
    if (text.length > 0 && !text.endsWith("\n")) {
      problems.push(`${rel}: missing final newline`);
    }

    const lines = text.split(/\n/);
    lines.forEach((line, index) => {
      if (/[ \t]+$/.test(line)) {
        problems.push(`${rel}:${index + 1}: trailing whitespace`);
      }
    });
  }
}

walk(rootDir);

if (problems.length > 0) {
  console.error("format: found formatting issues");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log("format: checked final newlines and trailing whitespace");
