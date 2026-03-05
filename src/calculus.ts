// =====================================================================
// Calculus — Numerical integration, differentiation, and discrete ops
// =====================================================================

const Calculus = {
  // ----------------------------------------------------------------
  // Numerical integration
  // ----------------------------------------------------------------

  /**
   * Integrate f(x) numerically from a to b.
   * @param f       Integrand function
   * @param a       Lower bound
   * @param b       Upper bound
   * @param method  'trapz' | 'simpson' | 'romberg' | 'gauss5' (default: 'simpson')
   * @param n       Number of subintervals (default: 1000; must be even for simpson)
   */
  integrate(
    f: (x: number) => number,
    a: number,
    b: number,
    method: "trapz" | "simpson" | "romberg" | "gauss5" = "simpson",
    n = 1000
  ): number {
    if (method === "trapz") return Calculus._trapz(f, a, b, n);
    if (method === "simpson")
      return Calculus._simpson(f, a, b, n % 2 === 0 ? n : n + 1);
    if (method === "romberg") return Calculus._romberg(f, a, b);
    if (method === "gauss5") return Calculus._gauss(f, a, b);
    throw new Error(`Unknown integration method: ${method}`);
  },

  /** Trapezoidal rule. */
  trapz(y: number[], x?: number[]): number {
    const n = y.length;
    if (n < 2) return 0;
    let sum = 0;
    if (x) {
      for (let i = 0; i < n - 1; i++)
        sum += 0.5 * (y[i] + y[i + 1]) * (x[i + 1] - x[i]);
    } else {
      for (let i = 0; i < n - 1; i++) sum += 0.5 * (y[i] + y[i + 1]);
    }
    return sum;
  },

  /** Composite Simpson's 1/3 rule on array data. */
  simps(y: number[], x?: number[]): number {
    const n = y.length;
    if (n < 3) return Calculus.trapz(y, x);
    const even = n % 2 === 1 ? n : n - 1;
    let sum = 0;
    for (let i = 0; i < even - 1; i += 2) {
      const h = x ? (x[i + 2] - x[i]) / 2 : 1;
      sum += (h / 3) * (y[i] + 4 * y[i + 1] + y[i + 2]);
    }
    // If even number of intervals (odd data points consumed), add last trapz
    if (even < n) {
      const h = x ? x[n - 1] - x[n - 2] : 1;
      sum += 0.5 * (y[n - 2] + y[n - 1]) * h;
    }
    return sum;
  },

  // ----------------------------------------------------------------
  // Numerical differentiation
  // ----------------------------------------------------------------

  /**
   * Compute f'(x) using central finite differences.
   * @param order 1 = first derivative, 2 = second derivative (default: 1)
   * @param h     Step size (default: cbrt(eps) ≈ 6e-6)
   */
  differentiate(
    f: (x: number) => number,
    x: number,
    order: 1 | 2 = 1,
    h = 6e-6
  ): number {
    if (order === 2) {
      return (f(x + h) - 2 * f(x) + f(x - h)) / (h * h);
    }
    return (f(x + h) - f(x - h)) / (2 * h);
  },

  /**
   * Compute the gradient (derivative at each point) of a 1D array.
   * Uses central differences in the interior, one-sided on the edges.
   * Equivalent to numpy.gradient.
   */
  gradient(y: number[], dx = 1): number[] {
    const n = y.length;
    if (n === 0) return [];
    if (n === 1) return [0];
    const result = new Array<number>(n);
    result[0] = (y[1] - y[0]) / dx;
    result[n - 1] = (y[n - 1] - y[n - 2]) / dx;
    for (let i = 1; i < n - 1; i++)
      result[i] = (y[i + 1] - y[i - 1]) / (2 * dx);
    return result;
  },

  /**
   * Compute the Jacobian matrix of f: R^n → R^m at point x.
   * Returns m×n matrix of partial derivatives.
   */
  jacobian(f: (x: number[]) => number[], x: number[], h = 1e-5): number[][] {
    const y0 = f(x);
    const m = y0.length,
      n = x.length;
    const J: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
    for (let j = 0; j < n; j++) {
      const xp = x.slice();
      xp[j] += h;
      const xm = x.slice();
      xm[j] -= h;
      const yp = f(xp),
        ym = f(xm);
      for (let i = 0; i < m; i++) J[i][j] = (yp[i] - ym[i]) / (2 * h);
    }
    return J;
  },

  /**
   * Compute the Hessian matrix of f: R^n → R at point x.
   * Returns n×n matrix of second partial derivatives.
   */
  hessian(f: (x: number[]) => number, x: number[], h = 1e-4): number[][] {
    const n = x.length;
    const H: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    const f0 = f(x);
    for (let i = 0; i < n; i++) {
      for (let j = i; j < n; j++) {
        let val: number;
        if (i === j) {
          const xp = x.slice();
          xp[i] += h;
          const xm = x.slice();
          xm[i] -= h;
          val = (f(xp) - 2 * f0 + f(xm)) / (h * h);
        } else {
          const xpp = x.slice();
          xpp[i] += h;
          xpp[j] += h;
          const xpm = x.slice();
          xpm[i] += h;
          xpm[j] -= h;
          const xmp = x.slice();
          xmp[i] -= h;
          xmp[j] += h;
          const xmm = x.slice();
          xmm[i] -= h;
          xmm[j] -= h;
          val = (f(xpp) - f(xpm) - f(xmp) + f(xmm)) / (4 * h * h);
        }
        H[i][j] = H[j][i] = val;
      }
    }
    return H;
  },

  // ----------------------------------------------------------------
  // Finite differences on arrays
  // ----------------------------------------------------------------

  /**
   * Compute n-th order discrete differences along an array.
   * Equivalent to numpy.diff.
   */
  diff(arr: number[], n = 1): number[] {
    let a = arr.slice();
    for (let i = 0; i < n; i++) {
      const next: number[] = [];
      for (let j = 1; j < a.length; j++) next.push(a[j] - a[j - 1]);
      a = next;
    }
    return a;
  },

  /** Cumulative sum — equivalent to numpy.cumsum. */
  cumsum(arr: number[]): number[] {
    const result: number[] = [];
    let sum = 0;
    for (const x of arr) {
      sum += x;
      result.push(sum);
    }
    return result;
  },

  /** Cumulative product — equivalent to numpy.cumprod. */
  cumprod(arr: number[]): number[] {
    const result: number[] = [];
    let prod = 1;
    for (const x of arr) {
      prod *= x;
      result.push(prod);
    }
    return result;
  },

  // ----------------------------------------------------------------
  // Solvers
  // ----------------------------------------------------------------

  /**
   * Find a root of f in the interval [a, b] via bisection.
   * @param tol Absolute tolerance (default: 1e-10)
   */
  bisect(
    f: (x: number) => number,
    a: number,
    b: number,
    tol = 1e-10,
    maxIter = 200
  ): number {
    let fa = f(a),
      fb = f(b);
    if (fa * fb > 0) throw new Error("f(a) and f(b) must have opposite signs");
    for (let i = 0; i < maxIter; i++) {
      const mid = (a + b) / 2;
      if (b - a < tol) return mid;
      const fm = f(mid);
      if (fm === 0) return mid;
      fa * fm < 0 ? (b = mid) : (a = mid);
    }
    return (a + b) / 2;
  },

  /**
   * Find a root of f near x0 using Newton-Raphson.
   * Optionally provide derivative df; if not given, uses numeric differentiation.
   */
  newton(
    f: (x: number) => number,
    x0: number,
    df?: (x: number) => number,
    tol = 1e-10,
    maxIter = 100
  ): number {
    let x = x0;
    const derivFn = df || ((xi: number) => Calculus.differentiate(f, xi));
    for (let i = 0; i < maxIter; i++) {
      const fx = f(x);
      if (Math.abs(fx) < tol) return x;
      const dfx = derivFn(x);
      if (Math.abs(dfx) < 1e-14)
        throw new Error("Newton's method: derivative too small");
      x -= fx / dfx;
    }
    return x;
  },

  /**
   * Fixed-point iteration: find x s.t. g(x) = x.
   */
  fixedPoint(
    g: (x: number) => number,
    x0: number,
    tol = 1e-10,
    maxIter = 200
  ): number {
    let x = x0;
    for (let i = 0; i < maxIter; i++) {
      const xn = g(x);
      if (Math.abs(xn - x) < tol) return xn;
      x = xn;
    }
    return x;
  },

  // ----------------------------------------------------------------
  // Internal integration methods
  // ----------------------------------------------------------------

  _trapz(f: (x: number) => number, a: number, b: number, n: number): number {
    const h = (b - a) / n;
    let sum = 0.5 * (f(a) + f(b));
    for (let i = 1; i < n; i++) sum += f(a + i * h);
    return sum * h;
  },

  _simpson(f: (x: number) => number, a: number, b: number, n: number): number {
    const h = (b - a) / n;
    let sum = f(a) + f(b);
    for (let i = 1; i < n; i++) sum += (i % 2 === 0 ? 2 : 4) * f(a + i * h);
    return (h / 3) * sum;
  },

  _romberg(
    f: (x: number) => number,
    a: number,
    b: number,
    maxOrder = 8
  ): number {
    const R: number[][] = [];
    for (let i = 0; i <= maxOrder; i++) {
      const n = 1 << i;
      const h = (b - a) / n;
      let sum = 0.5 * (f(a) + f(b));
      for (let k = 1; k < n; k++) sum += f(a + k * h);
      R.push([sum * h]);
      for (let j = 1; j <= i; j++) {
        const val =
          (Math.pow(4, j) * R[i][j - 1] - R[i - 1][j - 1]) /
          (Math.pow(4, j) - 1);
        R[i].push(val);
      }
      if (i > 0 && Math.abs(R[i][i] - R[i - 1][i - 1]) < 1e-12) return R[i][i];
    }
    return R[maxOrder][maxOrder];
  },

  /** 5-point Gauss-Legendre quadrature. */
  _gauss(f: (x: number) => number, a: number, b: number): number {
    // Weights and nodes for 5-point Gauss-Legendre on [-1,1]
    const nodes = [
      0, 0.538469310105683, -0.538469310105683, 0.906179845938664,
      -0.906179845938664,
    ];
    const weights = [
      0.568888888888889, 0.478628670499366, 0.478628670499366,
      0.236926885056189, 0.236926885056189,
    ];
    const mid = (a + b) / 2,
      half = (b - a) / 2;
    return (
      half *
      nodes.reduce((sum, xi, i) => sum + weights[i] * f(mid + half * xi), 0)
    );
  },
};

export default Calculus;
