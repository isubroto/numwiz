import fs from "node:fs";
import path from "node:path";

const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8")
);

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

const publicSubpaths = [
  ".",
  "./arithmetic",
  "./formatting",
  "./statistics",
  "./matrix",
  "./ndarray",
  "./linalg",
  "./fft",
  "./calculus",
  "./precision",
];

describe("package metadata", () => {
  test("keeps professional package metadata", () => {
    expect(packageJson.name).toBe("numwiz");
    expect(packageJson.main).toBe("dist/index.js");
    expect(packageJson.module).toBe("dist/index.mjs");
    expect(packageJson.types).toBe("dist/index.d.ts");
    expect(packageJson.sideEffects).toBe(false);
    expect(packageJson.engines.node).toBe(">=18");
  });

  test("exposes expected npm scripts", () => {
    for (const script of requiredScripts) {
      expect(packageJson.scripts[script]).toEqual(expect.any(String));
    }
  });

  test("declares dual import/require/types conditions for public exports", () => {
    for (const subpath of publicSubpaths) {
      expect(packageJson.exports[subpath]).toMatchObject({
        types: expect.stringMatching(/\.d\.ts$/),
        import: expect.stringMatching(/\.mjs$/),
        require: expect.stringMatching(/\.js$/),
        default: expect.stringMatching(/\.mjs$/),
      });
    }
  });
});
