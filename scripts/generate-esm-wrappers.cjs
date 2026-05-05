"use strict";

const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const srcDir = path.join(distDir, "src");

const rootNamedExports = [
  "numwiz",
  "NumWiz",
  "Arithmetic",
  "Comparison",
  "Validation",
  "Conversion",
  "Formatting",
  "Currency",
  "Random",
  "SeededRandom",
  "Statistics",
  "Bitwise",
  "Trigonometry",
  "Advanced",
  "Financial",
  "Range",
  "Sequences",
  "NumberWords",
  "Matrix",
  "NDArray",
  "LinAlg",
  "PolyModule",
  "Polynomial",
  "Calculus",
  "FFT",
  "Interpolation",
  "CubicSpline",
  "Signal",
  "BigPrecision",
  "RoundingMode",
];

const subpaths = [
  ["advanced"],
  ["arithmetic"],
  ["bitwise"],
  ["calculus"],
  ["comparison"],
  ["conversion"],
  ["currency"],
  ["fft"],
  ["financial"],
  ["formatting"],
  ["interpolation", ["CubicSpline"]],
  ["linalg"],
  ["matrix"],
  ["ndarray", ["NDArray"]],
  ["number-words"],
  ["polynomial", ["Polynomial"]],
  ["precision", ["RoundingMode"]],
  ["random", ["SeededRandom"]],
  ["range"],
  ["sequences"],
  ["signal"],
  ["statistics"],
  ["trigonometry"],
  ["types", [], true],
  ["validation"],
];

function writeFile(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${contents.trimEnd()}\n`, "utf8");
}

function rootWrapper() {
  const named = rootNamedExports
    .map((name) => `const ${name} = cjs.${name};`)
    .join("\n");
  const exportNames = rootNamedExports.join(", ");

  return `
import cjs from "./index.js";

${named}
const defaultExport = cjs.default ?? cjs.numwiz ?? cjs;

export { ${exportNames} };
export default defaultExport;
`;
}

function subpathWrapper(fileName, namedExports = [], isTypeOnly = false) {
  if (isTypeOnly) return "export {};";

  const named = namedExports
    .map((name) => `const ${name} = cjs.${name};`)
    .join("\n");
  const namedExportLine =
    namedExports.length > 0 ? `export { ${namedExports.join(", ")} };\n` : "";

  return `
import cjs from "./${fileName}.js";

${named}
const defaultExport = cjs.default ?? cjs;

${namedExportLine}export default defaultExport;
`;
}

if (!fs.existsSync(path.join(distDir, "index.js"))) {
  throw new Error("Cannot generate ESM wrappers before TypeScript build output exists.");
}

writeFile(path.join(distDir, "index.mjs"), rootWrapper());

for (const [fileName, namedExports, isTypeOnly] of subpaths) {
  writeFile(
    path.join(srcDir, `${fileName}.mjs`),
    subpathWrapper(fileName, namedExports, isTypeOnly)
  );
}

console.log(`Generated ESM compatibility wrappers in ${path.relative(rootDir, distDir)}`);
