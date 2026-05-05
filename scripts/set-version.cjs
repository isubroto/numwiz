"use strict";

const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const nextVersion = process.argv[2];

const semverPattern =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function fail(message) {
  console.error(`set-version: ${message}`);
  process.exit(1);
}

function readJsonFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const eol = text.includes("\r\n") ? "\r\n" : "\n";
  const indentMatch = text.match(/\n([ \t]+)"/);
  const indent = indentMatch ? indentMatch[1] : "  ";

  return {
    data: JSON.parse(text),
    eol,
    indent,
    hasFinalNewline: text.endsWith("\n"),
  };
}

function writeJsonFile(filePath, file) {
  let text = JSON.stringify(file.data, null, file.indent).replace(/\n/g, file.eol);
  if (file.hasFinalNewline) text += file.eol;
  fs.writeFileSync(filePath, text, "utf8");
}

function updatePackageJson() {
  const packagePath = path.join(rootDir, "package.json");
  const packageFile = readJsonFile(packagePath);
  packageFile.data.version = nextVersion;
  writeJsonFile(packagePath, packageFile);
}

function updatePackageLockJson() {
  const lockPath = path.join(rootDir, "package-lock.json");
  if (!fs.existsSync(lockPath)) return;

  const lockFile = readJsonFile(lockPath);
  lockFile.data.version = nextVersion;

  if (lockFile.data.packages && lockFile.data.packages[""]) {
    lockFile.data.packages[""].version = nextVersion;
  }

  writeJsonFile(lockPath, lockFile);
}

if (!nextVersion) fail("missing next version argument");
if (!semverPattern.test(nextVersion)) fail(`invalid semver version "${nextVersion}"`);

updatePackageJson();
updatePackageLockJson();

console.log(`set-version: package metadata updated to ${nextVersion}`);
