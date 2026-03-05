import Calculus from "../src/calculus";

const TOL = 1e-5;
function close(a: number, b: number, tol = TOL) {
  expect(Math.abs(a - b)).toBeLessThan(tol);
}
function arrClose(a: number[], b: number[], tol = TOL) {
  expect(a.length).toBe(b.length);
  a.forEach((v, i) => expect(Math.abs(v - b[i])).toBeLessThan(tol));
}

// ═══════════════════════════════════════════════════════════════════
// INTEGRATION
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — integrate", () => {
  const square = (x: number) => x * x;

  test("∫₀¹ x² dx = 1/3 (trapz)", () => {
    close(Calculus.integrate(square, 0, 1, "trapz", 10000), 1 / 3, 1e-4);
  });

  test("∫₀¹ x² dx = 1/3 (simpson)", () => {
    close(Calculus.integrate(square, 0, 1, "simpson", 100), 1 / 3, 1e-7);
  });

  test("∫₀¹ x² dx = 1/3 (romberg)", () => {
    close(Calculus.integrate(square, 0, 1, "romberg"), 1 / 3, 1e-10);
  });

  test("∫₀^π sin(x) dx = 2 (gauss5)", () => {
    close(Calculus.integrate(Math.sin, 0, Math.PI, "gauss5"), 2, 1e-6);
  });

  test("∫₀^π sin(x) dx = 2 (romberg)", () => {
    close(Calculus.integrate(Math.sin, 0, Math.PI, "romberg"), 2, 1e-10);
  });

  test("∫₀¹ e^x dx = e-1 (simpson)", () => {
    close(Calculus.integrate(Math.exp, 0, 1, "simpson", 100), Math.E - 1, 1e-7);
  });

  test("∫₀² 1 dx = 2 (constant function)", () => {
    close(
      Calculus.integrate(() => 1, 0, 2, "simpson"),
      2,
      1e-10
    );
  });
});

// ═══════════════════════════════════════════════════════════════════
// TRAPZ (array version)
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — trapz (array)", () => {
  test("uniform spacing", () => {
    const y = [0, 1, 4, 9]; // x² at 0,1,2,3
    // dx=1 trapz: 0.5*(0+1)+0.5*(1+4)+0.5*(4+9) = 0.5+2.5+6.5=9.5
    close(Calculus.trapz(y), 9.5);
  });

  test("with explicit x", () => {
    const x = [0, 1, 2, 3];
    const y = [0, 1, 4, 9];
    close(Calculus.trapz(y, x), 9.5);
  });

  test("non-uniform x", () => {
    const x = [0, 1, 3]; // two intervals: width 1 and 2
    const y = [0, 1, 9]; // x² at those points
    // 0.5*(0+1)*1 + 0.5*(1+9)*2 = 0.5 + 10 = 10.5
    close(Calculus.trapz(y, x), 10.5);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SIMPS (array version)
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — simps (array)", () => {
  test("∫₀¹ x² (5 equidistant points) ≈ 1/3", () => {
    const y = [0, 0.0625, 0.25, 0.5625, 1]; // x² at 0,0.25,0.5,0.75,1
    close(Calculus.simps(y, [0, 0.25, 0.5, 0.75, 1]), 1 / 3, 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════
// DIFFERENTIATE
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — differentiate", () => {
  test("d/dx(x²) at x=3 = 6", () => {
    close(
      Calculus.differentiate((x) => x * x, 3),
      6,
      1e-6
    );
  });

  test("d/dx(sin(x)) at x=0 = 1", () => {
    close(Calculus.differentiate(Math.sin, 0), 1, 1e-8);
  });

  test("d/dx(e^x) at x=0 = 1", () => {
    close(Calculus.differentiate(Math.exp, 0), 1, 1e-8);
  });

  test("second derivative d²/dx²(x³) at x=2 = 12", () => {
    close(
      Calculus.differentiate((x) => x ** 3, 2, 2),
      12,
      1e-4
    );
  });

  test("first derivative of constant = 0", () => {
    close(
      Calculus.differentiate(() => 5, 0),
      0,
      1e-10
    );
  });
});

// ═══════════════════════════════════════════════════════════════════
// GRADIENT (discrete)
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — gradient", () => {
  test("gradient of linear [0,1,2,3,4] = all 1s", () => {
    arrClose(Calculus.gradient([0, 1, 2, 3, 4]), [1, 1, 1, 1, 1]);
  });

  test("gradient of [0,1,4,9] (x² at 0,1,2,3)", () => {
    // interior: (4-0)/2=2, (9-1)/2=4; edges: 1,5
    arrClose(Calculus.gradient([0, 1, 4, 9]), [1, 2, 4, 5]);
  });

  test("gradient with custom dx", () => {
    arrClose(Calculus.gradient([0, 2, 4, 6], 2), [1, 1, 1, 1]);
  });

  test("gradient of constant = all zeros", () => {
    arrClose(Calculus.gradient([5, 5, 5, 5]), [0, 0, 0, 0]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// JACOBIAN
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — jacobian", () => {
  test("identity function J=I", () => {
    const f = (x: number[]) => x;
    const J = Calculus.jacobian(f, [1, 2]);
    expect(J.length).toBe(2);
    close(J[0][0], 1, 1e-6);
    close(J[0][1], 0, 1e-6);
    close(J[1][0], 0, 1e-6);
    close(J[1][1], 1, 1e-6);
  });

  test("f(x,y)=[x²,y²] at (2,3) → J=[[4,0],[0,6]]", () => {
    const f = (x: number[]) => [x[0] ** 2, x[1] ** 2];
    const J = Calculus.jacobian(f, [2, 3]);
    close(J[0][0], 4, 1e-4);
    close(J[0][1], 0, 1e-4);
    close(J[1][0], 0, 1e-4);
    close(J[1][1], 6, 1e-4);
  });
});

// ═══════════════════════════════════════════════════════════════════
// HESSIAN
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — hessian", () => {
  test("f=x²+y² → H=2I", () => {
    const f = (x: number[]) => x[0] ** 2 + x[1] ** 2;
    const H = Calculus.hessian(f, [0, 0]);
    close(H[0][0], 2, 1e-3);
    close(H[1][1], 2, 1e-3);
    close(H[0][1], 0, 1e-4);
    close(H[1][0], 0, 1e-4);
  });
});

// ═══════════════════════════════════════════════════════════════════
// DIFF (finite differences)
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — diff", () => {
  test("1st order diff of [1,2,4,7,11]", () => {
    arrClose(Calculus.diff([1, 2, 4, 7, 11]), [1, 2, 3, 4]);
  });

  test("2nd order diff of [1,4,9,16,25]", () => {
    // first diff: [3,5,7,9]; second diff: [2,2,2]
    arrClose(Calculus.diff([1, 4, 9, 16, 25], 2), [2, 2, 2]);
  });

  test("n=0 returns copy", () => {
    arrClose(Calculus.diff([1, 2, 3], 0), [1, 2, 3]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// CUMSUM / CUMPROD
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — cumsum / cumprod", () => {
  test("cumsum [1,2,3,4]", () => {
    arrClose(Calculus.cumsum([1, 2, 3, 4]), [1, 3, 6, 10]);
  });

  test("cumprod [1,2,3,4]", () => {
    arrClose(Calculus.cumprod([1, 2, 3, 4]), [1, 2, 6, 24]);
  });

  test("cumsum of zeros", () => {
    arrClose(Calculus.cumsum([0, 0, 0]), [0, 0, 0]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// BISECT
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — bisect", () => {
  test("root of x²-2 in [1,2] ≈ √2", () => {
    close(
      Calculus.bisect((x) => x ** 2 - 2, 1, 2),
      Math.SQRT2,
      1e-8
    );
  });

  test("root of sin(x) in [2,4] ≈ π", () => {
    close(Calculus.bisect(Math.sin, 2, 4), Math.PI, 1e-8);
  });

  test("f(a) and f(b) same sign throws", () => {
    expect(() => Calculus.bisect((x) => x ** 2, -1, 1)).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════
// NEWTON
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — newton", () => {
  test("x²-2=0 near x=1 → √2", () => {
    close(
      Calculus.newton(
        (x) => x ** 2 - 2,
        1,
        (x) => 2 * x
      ),
      Math.SQRT2,
      1e-10
    );
  });

  test("without df: numeric differentiation", () => {
    close(
      Calculus.newton((x) => x ** 3 - 8, 3),
      2,
      1e-8
    );
  });
});

// ═══════════════════════════════════════════════════════════════════
// FIXED POINT
// ═══════════════════════════════════════════════════════════════════
describe("Calculus — fixedPoint", () => {
  test("g(x) = cos(x) converges to ~0.739", () => {
    const fp = Calculus.fixedPoint(Math.cos, 0);
    expect(Math.abs(fp - Math.cos(fp))).toBeLessThan(1e-8);
  });
});
