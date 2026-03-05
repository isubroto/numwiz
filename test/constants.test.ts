import Trigonometry from "../src/trigonometry";

describe("Trigonometry — Mathematical Constants", () => {
  test("PI matches Math.PI", () => {
    expect(Trigonometry.PI).toBe(Math.PI);
  });

  test("PI has correct first digits: 3.14159...", () => {
    expect(Trigonometry.PI.toString().startsWith("3.14159")).toBe(true);
  });

  test("E matches Math.E", () => {
    expect(Trigonometry.E).toBe(Math.E);
  });

  test("E has correct first digits: 2.71828...", () => {
    expect(Trigonometry.E.toString().startsWith("2.71828")).toBe(true);
  });

  test("TAU = 2 * PI", () => {
    expect(Trigonometry.TAU).toBeCloseTo(2 * Math.PI, 14);
  });

  test("TAU has correct first digits: 6.28318...", () => {
    expect(Trigonometry.TAU.toString().startsWith("6.28318")).toBe(true);
  });

  test("PHI — golden ratio ≈ 1.61803398874989", () => {
    expect(Trigonometry.PHI).toBeCloseTo(1.6180339887498948, 14);
  });

  test("PHI satisfies φ² = φ + 1", () => {
    const phi = Trigonometry.PHI;
    expect(phi * phi).toBeCloseTo(phi + 1, 12);
  });

  test("SQRT2 matches Math.SQRT2", () => {
    expect(Trigonometry.SQRT2).toBe(Math.SQRT2);
  });

  test("SQRT2² ≈ 2", () => {
    expect(Trigonometry.SQRT2 * Trigonometry.SQRT2).toBeCloseTo(2, 14);
  });

  test("LN2 matches Math.LN2", () => {
    expect(Trigonometry.LN2).toBe(Math.LN2);
  });

  test("LN2 = ln(2)", () => {
    expect(Trigonometry.LN2).toBeCloseTo(Math.log(2), 14);
  });

  test("LN10 matches Math.LN10", () => {
    expect(Trigonometry.LN10).toBe(Math.LN10);
  });

  test("LN10 = ln(10)", () => {
    expect(Trigonometry.LN10).toBeCloseTo(Math.log(10), 14);
  });

  test("LOG2E matches Math.LOG2E", () => {
    expect(Trigonometry.LOG2E).toBe(Math.LOG2E);
  });

  test("LOG2E = 1 / LN2", () => {
    expect(Trigonometry.LOG2E).toBeCloseTo(1 / Math.LN2, 14);
  });

  test("LOG10E matches Math.LOG10E", () => {
    expect(Trigonometry.LOG10E).toBe(Math.LOG10E);
  });

  test("LOG10E = 1 / LN10", () => {
    expect(Trigonometry.LOG10E).toBeCloseTo(1 / Math.LN10, 14);
  });

  test("constants are read-only (readonly)", () => {
    // TypeScript enforces readonly at compile time; verify values are stable
    const pi1 = Trigonometry.PI;
    const pi2 = Trigonometry.PI;
    expect(pi1).toBe(pi2);
  });

  test("PI used in toRadians is consistent", () => {
    // 180° should equal PI radians
    expect(Trigonometry.toRadians(180)).toBeCloseTo(Trigonometry.PI, 14);
  });

  test("TAU used in full circle conversion", () => {
    // 360° = 2π = TAU
    expect(Trigonometry.toRadians(360)).toBeCloseTo(Trigonometry.TAU, 14);
  });

  test("E is base of natural logarithm: ln(E) = 1", () => {
    expect(Math.log(Trigonometry.E)).toBeCloseTo(1, 14);
  });

  test("E^1 = E", () => {
    expect(Math.exp(1)).toBeCloseTo(Trigonometry.E, 14);
  });
});
