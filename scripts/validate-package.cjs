"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync, execSync } = require("node:child_process");

const rootDir = path.resolve(__dirname, "..");
const packageJson = require(path.join(rootDir, "package.json"));
const nodeBin = process.execPath;

function fail(message) {
  throw new Error(`package validation failed: ${message}`);
}

function assertFileExists(relPath) {
  const abs = path.join(rootDir, relPath);
  if (!fs.existsSync(abs)) fail(`missing ${relPath}`);
}

for (const [subpath, target] of Object.entries(packageJson.exports || {})) {
  if (subpath === "./package.json") continue;
  assertFileExists(target.types);
  assertFileExists(target.import);
  assertFileExists(target.require);
}

const smokeTests = [
  {
    label: "CommonJS root export",
    args: [
      "-e",
      "const pkg = require('numwiz'); if (pkg.Arithmetic.add(1, 2) !== 3) process.exit(1); if (pkg.default(2).add(3).val() !== 5) process.exit(1);",
    ],
  },
  {
    label: "ESM root export",
    args: [
      "--input-type=module",
      "-e",
      "import numwiz, { Arithmetic } from 'numwiz'; if (Arithmetic.add(2, 3) !== 5) process.exit(1); if (numwiz(2).multiply(4).val() !== 8) process.exit(1);",
    ],
  },
  {
    label: "CommonJS subpath export",
    args: [
      "-e",
      "const Arithmetic = require('numwiz/arithmetic').default || require('numwiz/arithmetic'); if (Arithmetic.multiply(2, 4) !== 8) process.exit(1);",
    ],
  },
  {
    label: "ESM subpath export",
    args: [
      "--input-type=module",
      "-e",
      "import Matrix from 'numwiz/matrix'; if (Matrix.determinant([[1, 2], [3, 4]]) !== -2) process.exit(1);",
    ],
  },
];

for (const test of smokeTests) {
  execFileSync(nodeBin, test.args, {
    cwd: rootDir,
    stdio: "pipe",
    env: { ...process.env, NODE_ENV: "test" },
  });
  console.log(`package: ${test.label} ok`);
}

execSync("npm pack --dry-run", {
  cwd: rootDir,
  stdio: "inherit",
});

console.log("package: exports, dual import modes, and npm pack dry-run validated");
