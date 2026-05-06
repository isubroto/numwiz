import Interpolation, { CubicSpline } from "../src/interpolation";

const TOL = 1e-9;
function close(a: number, b: number, tol = TOL) {
  expect(Math.abs(a - b)).toBeLessThan(tol);
}
function arrClose(a: number[], b: number[], tol = TOL) {
  expect(a.length).toBe(b.length);
  a.forEach((v, i) => expect(Math.abs(v - b[i])).toBeLessThan(tol));
}

// ═══════════════════════════════════════════════════════════════════
// LINEAR INTERPOLATION
// ═══════════════════════════════════════════════════════════════════
describe("Interpolation — linear", () => {
  const xp = [0, 1, 2, 3];
  const yp = [0, 1, 4, 9]; // x² at integers

  const lin = (x: number) => Interpolation.linear(x, xp, yp) as number;

  test("exact at knots", () => {
    close(lin(1), 1);
    close(lin(2), 4);
    close(lin(3), 9);
  });

  test("midpoint interpolation", () => {
    // between (0,0) and (1,1): midpoint = 0.5
    close(lin(0.5), 0.5);
    // between (1,1) and (2,4): at x=1.5 → 1 + 0.5*(4-1) = 2.5
    close(lin(1.5), 2.5);
  });

  test("clamped extrapolation at left boundary", () => {
    close(lin(-1), 0);
  });

  test("clamped extrapolation at right boundary", () => {
    close(lin(10), 9);
  });

  test("array input x", () => {
    const results = Interpolation.linear([0.5, 1.5, 2.5], xp, yp) as number[];
    expect(results.length).toBe(3);
    close(results[0], 0.5);
    close(results[1], 2.5);
    // between (2,4) and (3,9): at 2.5 → 4 + 0.5*(9-4) = 6.5
    close(results[2], 6.5);
  });

  test("single-element result for scalar x is a number", () => {
    expect(typeof lin(0.5)).toBe("number");
  });
});

// ═══════════════════════════════════════════════════════════════════
// NEAREST NEIGHBOR
// ═══════════════════════════════════════════════════════════════════
describe("Interpolation — nearestNeighbor", () => {
  const xp = [0, 1, 2, 3];
  const yp = [10, 20, 30, 40];

  const nn = (x: number) => Interpolation.nearestNeighbor(x, xp, yp) as number;

  test("exact at knots", () => {
    close(nn(1), 20);
  });

  test("rounds to nearest", () => {
    // x=0.4 is closer to 0 → 10, x=0.6 is closer to 1 → 20
    expect(nn(0.4)).toBe(10);
    expect(nn(0.6)).toBe(20);
  });

  test("array input", () => {
    const r = Interpolation.nearestNeighbor([0.1, 2.9], xp, yp) as number[];
    expect(r[0]).toBe(10);
    expect(r[1]).toBe(40);
  });
});

// ═══════════════════════════════════════════════════════════════════
// POLYNOMIAL (LAGRANGE) INTERPOLATION
// ═══════════════════════════════════════════════════════════════════
describe("Interpolation — polynomial (Lagrange)", () => {
  test("exact at knots", () => {
    const xp = [0, 1, 2];
    const yp = [0, 1, 4]; // x²
    close(Interpolation.polynomial(0, xp, yp) as number, 0, 1e-10);
    close(Interpolation.polynomial(1, xp, yp) as number, 1, 1e-10);
    close(Interpolation.polynomial(2, xp, yp) as number, 4, 1e-10);
  });

  test("interpolated x=1.5 for y=x² ≈ 2.25", () => {
    const xp = [0, 1, 2, 3];
    const yp = [0, 1, 4, 9];
    close(Interpolation.polynomial(1.5, xp, yp) as number, 2.25, 1e-8);
  });
});

// ═══════════════════════════════════════════════════════════════════
// CUBIC SPLINE CLASS
// ═══════════════════════════════════════════════════════════════════
describe("CubicSpline — construction & evaluation", () => {
  const xp = [0, 1, 2, 3, 4];
  const yp = [0, 1, 4, 9, 16]; // x²

  const cs = new CubicSpline(xp, yp);

  test("exact at knots", () => {
    xp.forEach((x, i) => close(cs.evaluate(x), yp[i], 1e-10));
  });

  test("smooth within intervals (interpolated values are finite and ordered)", () => {
    // Natural cubic spline doesn't reproduce quadratics exactly, but should be near the correct values
    const v05 = cs.evaluate(0.5);
    const v25 = cs.evaluate(2.5);
    expect(isFinite(v05)).toBe(true);
    expect(isFinite(v25)).toBe(true);
    // Values should be "roughly" near x² since y=x² was given
    expect(Math.abs(v05 - 0.25)).toBeLessThan(0.5);
    expect(Math.abs(v25 - 6.25)).toBeLessThan(0.5);
  });

  test("evaluates within domain without error", () => {
    expect(() => cs.evaluate(0.5)).not.toThrow();
    expect(() => cs.evaluate(3.5)).not.toThrow();
  });
});

describe("CubicSpline — two point data", () => {
  const cs = new CubicSpline([0, 2], [10, 20]);

  test("falls back to exact linear spline", () => {
    close(cs.evaluate(1), 15, 1e-12);
    close(cs.derivative(1), 5, 1e-12);
    close(cs.secondDerivative(1), 0, 1e-12);
    close(cs.integral(0, 2), 30, 1e-12);
  });
});

describe("CubicSpline — linear data exact", () => {
  // Linear y=x: spline should be EXACTLY linear
  const xp = [0, 1, 2, 3, 4];
  const yp = [0, 1, 2, 3, 4];
  const cs = new CubicSpline(xp, yp);

  test("exact at midpoints for y=x", () => {
    close(cs.evaluate(0.5), 0.5, 1e-9);
    close(cs.evaluate(1.5), 1.5, 1e-9);
    close(cs.evaluate(2.5), 2.5, 1e-9);
  });
});

describe("CubicSpline — derivative", () => {
  // Use linear y=x where spline derivative should be exactly 1
  const xp = [0, 1, 2, 3, 4];
  const yp = [0, 1, 2, 3, 4]; // y=x
  const cs = new CubicSpline(xp, yp);

  test("d/dx(x) = 1 at interior points", () => {
    close(cs.derivative(1), 1, 1e-6);
    close(cs.derivative(2), 1, 1e-6);
    close(cs.derivative(3), 1, 1e-6);
  });
});

describe("CubicSpline — integral", () => {
  // Use linear y=x where integral is exact:  ∫₀¹ x dx = 0.5, ∫₀⁴ x dx = 8
  const xp = [0, 1, 2, 3, 4];
  const yp = [0, 1, 2, 3, 4]; // y=x
  const cs = new CubicSpline(xp, yp);

  test("∫₀¹ x dx = 0.5 (exact for linear spline)", () => {
    close(cs.integral(0, 1), 0.5, 1e-9);
  });

  test("∫₀⁴ x dx = 8", () => {
    close(cs.integral(0, 4), 8, 1e-9);
  });
});

// ═══════════════════════════════════════════════════════════════════
// PCHIP
// ═══════════════════════════════════════════════════════════════════
describe("Interpolation — pchip", () => {
  const xp = [0, 1, 2, 3, 4];
  const yp = [0, 1, 2, 3, 4]; // linear

  test("exact at knots", () => {
    xp.forEach((x, i) =>
      close(Interpolation.pchip(x, xp, yp) as number, yp[i], 1e-10)
    );
  });

  test("monotonic on monotone data", () => {
    // yp is increasing, every interpolated value should be in [0,4]
    const xs = [0.5, 1.5, 2.5, 3.5];
    xs.forEach((x) => {
      const v = Interpolation.pchip(x, xp, yp) as number;
      expect(v).toBeGreaterThanOrEqual(0 - 1e-9);
      expect(v).toBeLessThanOrEqual(4 + 1e-9);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// BILINEAR
// ═══════════════════════════════════════════════════════════════════
describe("Interpolation — bilinear", () => {
  // Grid [0,1]×[0,1] with z = x+y
  const xs = [0, 1];
  const ys = [0, 1];
  const zs = [
    [0, 1],
    [1, 2],
  ]; // z[xi][yi] = xi+yi

  test("center (0.5,0.5) = 1", () => {
    close(Interpolation.bilinear(0.5, 0.5, xs, ys, zs), 1, 1e-10);
  });

  test("exact at corner (0,0) = 0", () => {
    close(Interpolation.bilinear(0, 0, xs, ys, zs), 0, 1e-10);
  });

  test("exact at corner (1,1) = 2", () => {
    close(Interpolation.bilinear(1, 1, xs, ys, zs), 2, 1e-10);
  });

  test("midpoint of one axis", () => {
    close(Interpolation.bilinear(0.5, 0, xs, ys, zs), 0.5, 1e-10);
    close(Interpolation.bilinear(0, 0.5, xs, ys, zs), 0.5, 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════
// INTERP (routing)
// ═══════════════════════════════════════════════════════════════════
describe("Interpolation — interp", () => {
  const xp = [0, 1, 2, 3];
  const yp = [0, 1, 4, 9];

  test("linear method", () => {
    close(Interpolation.interp(0.5, xp, yp, "linear") as number, 0.5);
  });

  test("nearest-neighbor method", () => {
    expect([0, 1]).toContain(
      Interpolation.interp(0.4, xp, yp, "nearest") as number
    );
  });

  test("cubic method returns a number", () => {
    expect(typeof Interpolation.interp(1.5, xp, yp, "cubic")).toBe("number");
  });

  test("default method (linear or cubic)", () => {
    const v = Interpolation.interp(2.0, xp, yp) as number;
    close(v, 4, 1e-6);
  });
});
