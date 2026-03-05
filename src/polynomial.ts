// =====================================================================
// Polynomial — NumWiz polynomial arithmetic and fitting
// API mirrors numpy.polynomial.polynomial (highest-to-lowest degree)
// =====================================================================

/**
 * Polynomial class — stores coefficients highest-to-lowest degree.
 *
 * Example:  `new Polynomial([1, -3, 2])` represents x² − 3x + 2
 */
export class Polynomial {
  /** Coefficients from highest to lowest degree. */
  readonly coeffs: number[];
  readonly degree: number;

  constructor(coefficients: number[]) {
    // Strip leading zeros
    let start = 0;
    while (start < coefficients.length - 1 && coefficients[start] === 0)
      start++;
    this.coeffs = coefficients.slice(start);
    this.degree = this.coeffs.length - 1;
  }

  // ----------------------------------------------------------------
  // Evaluation
  // ----------------------------------------------------------------

  /** Evaluate the polynomial at a scalar x using Horner's method. */
  evaluate(x: number): number {
    return this.coeffs.reduce((acc, c) => acc * x + c, 0);
  }

  /** Evaluate at each element of an array. */
  evaluateMany(xs: number[]): number[] {
    return xs.map((x) => this.evaluate(x));
  }

  // ----------------------------------------------------------------
  // Arithmetic
  // ----------------------------------------------------------------

  add(other: Polynomial): Polynomial {
    const a = this.coeffs,
      b = other.coeffs;
    const la = a.length,
      lb = b.length;
    const len = Math.max(la, lb);
    const result = new Array<number>(len).fill(0);
    for (let i = 0; i < la; i++) result[len - la + i] += a[i];
    for (let i = 0; i < lb; i++) result[len - lb + i] += b[i];
    return new Polynomial(result);
  }

  subtract(other: Polynomial): Polynomial {
    return this.add(other.negate());
  }

  multiply(other: Polynomial): Polynomial {
    const a = this.coeffs,
      b = other.coeffs;
    const result = new Array<number>(a.length + b.length - 1).fill(0);
    for (let i = 0; i < a.length; i++)
      for (let j = 0; j < b.length; j++) result[i + j] += a[i] * b[j];
    return new Polynomial(result);
  }

  /** Scalar multiplication. */
  scale(s: number): Polynomial {
    return new Polynomial(this.coeffs.map((c) => c * s));
  }

  negate(): Polynomial {
    return this.scale(-1);
  }

  /**
   * Divide this polynomial by `divisor`.
   * Returns `{ quotient, remainder }` using synthetic / long division.
   */
  divide(divisor: Polynomial): { quotient: Polynomial; remainder: Polynomial } {
    if (divisor.degree === 0) {
      if (divisor.coeffs[0] === 0)
        throw new Error("Division by zero polynomial");
      return {
        quotient: this.scale(1 / divisor.coeffs[0]),
        remainder: Polynomial.zero(),
      };
    }

    const result: number[] = [...this.coeffs];
    const div = divisor.coeffs;

    for (let i = 0; i <= this.degree - divisor.degree; i++) {
      const factor = result[i] / div[0];
      for (let j = 0; j < div.length; j++) result[i + j] -= factor * div[j];
      result[i] = factor; // store quotient coefficient
    }

    const qLen = this.degree - divisor.degree + 1;
    return {
      quotient: new Polynomial(result.slice(0, qLen)),
      remainder: new Polynomial(result.slice(qLen)),
    };
  }

  pow(n: number): Polynomial {
    if (!Number.isInteger(n) || n < 0)
      throw new RangeError("Exponent must be a non-negative integer");
    if (n === 0) return Polynomial.one();
    let result = Polynomial.one();
    let base: Polynomial = this;
    let exp = n;
    while (exp > 0) {
      if (exp & 1) result = result.multiply(base);
      base = base.multiply(base);
      exp >>= 1;
    }
    return result;
  }

  /** Greatest common divisor via Euclidean algorithm. */
  gcd(other: Polynomial): Polynomial {
    let a: Polynomial = this,
      b: Polynomial = other;
    while (b.degree > 0 || Math.abs(b.coeffs[0]) > 1e-12) {
      const { remainder } = a.divide(b);
      if (remainder.coeffs.every((c) => Math.abs(c) < 1e-12)) {
        // Normalize
        return b.scale(1 / b.coeffs[0]);
      }
      a = b;
      b = remainder;
    }
    return Polynomial.one();
  }

  // ----------------------------------------------------------------
  // Calculus
  // ----------------------------------------------------------------

  /** Formal derivative. */
  derivative(): Polynomial {
    if (this.degree === 0) return Polynomial.zero();
    const result: number[] = [];
    for (let i = 0; i < this.degree; i++) {
      result.push(this.coeffs[i] * (this.degree - i));
    }
    return new Polynomial(result);
  }

  /** Indefinite integral with constant of integration c. */
  integral(c = 0): Polynomial {
    const result: number[] = [];
    for (let i = 0; i <= this.degree; i++) {
      result.push(this.coeffs[i] / (this.degree - i + 1));
    }
    result.push(c);
    return new Polynomial(result);
  }

  /** Definite integral ∫ₐᵇ p(x) dx. */
  definiteIntegral(a: number, b: number): number {
    const F = this.integral(0);
    return F.evaluate(b) - F.evaluate(a);
  }

  // ----------------------------------------------------------------
  // Roots
  // ----------------------------------------------------------------

  /**
   * Find all real roots via companion matrix eigenvalues.
   * Returns real parts only for real-valued roots.
   */
  roots(): number[] {
    const n = this.degree;
    if (n === 0) return [];
    if (n === 1) return [-this.coeffs[1] / this.coeffs[0]];
    if (n === 2)
      return _quadroots(this.coeffs[0], this.coeffs[1], this.coeffs[2]);

    // Build companion matrix
    const c = this.coeffs.map((ci) => ci / this.coeffs[0]);
    const C: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 1; i < n; i++) C[i][i - 1] = 1;
    for (let i = 0; i < n; i++) C[0][i] = -c[i + 1];

    // QR iteration for eigenvalues
    const eigenvals = _qrEigenvalues(C);
    return eigenvals.filter((v) => !isNaN(v)).sort((a, b) => a - b);
  }

  // ----------------------------------------------------------------
  // Composition
  // ----------------------------------------------------------------

  /** Compose: returns p(q(x)). */
  compose(q: Polynomial): Polynomial {
    let result = Polynomial.zero();
    for (const coeff of this.coeffs) {
      result = result
        .scale(1)
        .multiply(q)
        .add(new Polynomial([coeff]));
    }
    // Actual Horner: result = c[0]*q^n + ... via nested multiply
    result = new Polynomial([this.coeffs[0]]);
    for (let i = 1; i < this.coeffs.length; i++) {
      result = result.multiply(q).add(new Polynomial([this.coeffs[i]]));
    }
    return result;
  }

  // ----------------------------------------------------------------
  // Fitting
  // ----------------------------------------------------------------

  /**
   * Least-squares polynomial fit to data.
   * Equivalent to numpy.polyfit.
   */
  static fit(x: number[], y: number[], degree: number): Polynomial {
    if (x.length !== y.length)
      throw new RangeError("x and y must have same length");
    if (degree >= x.length)
      throw new RangeError("degree must be less than number of data points");

    const m = x.length,
      n = degree + 1;
    // Build Vandermonde matrix (highest power first)
    const V: number[][] = Array.from({ length: m }, (_, i) =>
      Array.from({ length: n }, (_, j) => Math.pow(x[i], degree - j))
    );

    // Normal equations: V^T V c = V^T y
    const VT = V[0].map((_, ci) => V.map((row) => row[ci]));
    const VTV: number[][] = VT.map((row) =>
      VT[0].map((_, ci) =>
        row.reduce((s, _, ri) => s + V[ri][ri > 0 ? 0 : 0], 0)
      )
    );

    // Use the simpler direct equation approach
    const VTVmat = matMul_poly(VT, V);
    const VTy = VT.map((row) => row.reduce((s, v, i) => s + v * y[i], 0));

    const coeffs = _solveLinear(VTVmat, VTy);
    return new Polynomial(coeffs);
  }

  /**
   * Evaluate polynomial at multiple x values (array of fitted y).
   */
  static polyval(p: Polynomial | number[], x: number[]): number[] {
    const poly = Array.isArray(p) ? new Polynomial(p) : p;
    return x.map((xi) => poly.evaluate(xi));
  }

  // ----------------------------------------------------------------
  // Factory methods
  // ----------------------------------------------------------------

  static zero(): Polynomial {
    return new Polynomial([0]);
  }
  static one(): Polynomial {
    return new Polynomial([1]);
  }
  static fromRoots(roots: number[]): Polynomial {
    return roots.reduce(
      (p, r) => p.multiply(new Polynomial([1, -r])),
      Polynomial.one()
    );
  }

  // ----------------------------------------------------------------
  // Representation
  // ----------------------------------------------------------------

  toString(variable = "x"): string {
    if (this.degree === 0) return String(this.coeffs[0]);
    const terms: string[] = [];
    for (let i = 0; i <= this.degree; i++) {
      const c = this.coeffs[i];
      if (Math.abs(c) < 1e-14) continue;
      const power = this.degree - i;
      let term = "";
      const absC = Math.abs(c);
      if (power === 0) term = absC === 1 ? "1" : String(_fmt(absC));
      else if (absC !== 1)
        term = `${_fmt(absC)}${variable}${power > 1 ? `^${power}` : ""}`;
      else term = `${variable}${power > 1 ? `^${power}` : ""}`;
      terms.push(c < 0 ? `- ${term}` : `+ ${term}`);
    }
    if (terms.length === 0) return "0";
    const first = terms[0].startsWith("+ ") ? terms[0].slice(2) : terms[0];
    return [first, ...terms.slice(1)].join(" ");
  }

  toJSON(): { coefficients: number[] } {
    return { coefficients: this.coeffs };
  }
}

// ---- Module-level convenience functions ----

const PolyModule = {
  /** Create a Polynomial from coefficients. */
  poly(coefficients: number[]): Polynomial {
    return new Polynomial(coefficients);
  },

  /** Create a polynomial from its roots. */
  polyFromRoots(roots: number[]): Polynomial {
    return Polynomial.fromRoots(roots);
  },

  /** Evaluate polynomial at x. */
  polyval(p: number[] | Polynomial, x: number | number[]): number | number[] {
    const poly = Array.isArray(p) ? new Polynomial(p) : p;
    if (Array.isArray(x)) return x.map((xi) => poly.evaluate(xi));
    return poly.evaluate(x as number);
  },

  /** Polynomial coefficient of best-fit. */
  polyfit(x: number[], y: number[], degree: number): number[] {
    return Polynomial.fit(x, y, degree).coeffs;
  },

  /** Polynomial roots (real parts). */
  polyroots(coefficients: number[]): number[] {
    return new Polynomial(coefficients).roots();
  },

  /** Polynomial derivative (returns coefficients). */
  polyder(coefficients: number[], times = 1): number[] {
    let p = new Polynomial(coefficients);
    for (let i = 0; i < times; i++) p = p.derivative();
    return p.coeffs;
  },

  /** Polynomial integral (returns coefficients, constant c=0). */
  polyint(coefficients: number[], c = 0): number[] {
    return new Polynomial(coefficients).integral(c).coeffs;
  },

  /** Add two polynomials (as coefficient arrays). */
  polyadd(a: number[], b: number[]): number[] {
    return new Polynomial(a).add(new Polynomial(b)).coeffs;
  },

  /** Multiply two polynomials. */
  polymul(a: number[], b: number[]): number[] {
    return new Polynomial(a).multiply(new Polynomial(b)).coeffs;
  },

  /** Divide two polynomials. Returns { quotient, remainder } as coefficient arrays. */
  polydiv(
    a: number[],
    b: number[]
  ): { quotient: number[]; remainder: number[] } {
    const { quotient, remainder } = new Polynomial(a).divide(new Polynomial(b));
    return { quotient: quotient.coeffs, remainder: remainder.coeffs };
  },

  Polynomial,
};

export default PolyModule;

// ---- Internal helpers ----

function _fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/\.?0+$/, "");
}

function _quadroots(a: number, b: number, c: number): number[] {
  const disc = b * b - 4 * a * c;
  if (disc < 0) return [];
  if (disc === 0) return [-b / (2 * a)];
  const sqrtD = Math.sqrt(disc);
  return [(-b - sqrtD) / (2 * a), (-b + sqrtD) / (2 * a)].sort((x, y) => x - y);
}

function matMul_poly(A: number[][], B: number[][]): number[][] {
  const m = A.length,
    k = A[0].length,
    n = B[0].length;
  const C = Array.from({ length: m }, () => new Array(n).fill(0));
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let l = 0; l < k; l++) {
        C[i][j] += A[i][l] * B[l][j];
      }
  return C;
}

function _solveLinear(A: number[][], b: number[]): number[] {
  const n = A.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
    }
    [M[col], M[maxRow]] = [M[maxRow], M[col]];
    const piv = M[col][col];
    if (Math.abs(piv) < 1e-14) continue;
    for (let row = col + 1; row < n; row++) {
      const f = M[row][col] / piv;
      for (let j = col; j <= n; j++) M[row][j] -= f * M[col][j];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = M[i][n];
    for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j];
    x[i] /= M[i][i];
  }
  return x;
}

function _qrEigenvalues(A: number[][]): number[] {
  let Ak = A.map((r) => r.slice());
  const n = Ak.length;
  const MAX_ITER = 500;
  const EPS = 1e-10;

  for (let iter = 0; iter < MAX_ITER; iter++) {
    // Wilkinson shift
    const d = (Ak[n - 2][n - 2] - Ak[n - 1][n - 1]) / 2;
    const sigma =
      Ak[n - 1][n - 1] -
      (Math.sign(d || 1) * Ak[n - 2][n - 1] ** 2) /
        (Math.abs(d) + Math.sqrt(d * d + Ak[n - 2][n - 1] ** 2));

    for (let i = 0; i < n; i++) Ak[i][i] -= sigma;
    const { Q, R } = _qrHouseholder(Ak);
    Ak = matMul_poly(R, Q);
    for (let i = 0; i < n; i++) Ak[i][i] += sigma;

    let off = 0;
    for (let i = 1; i < n; i++) off += Ak[i][i - 1] ** 2;
    if (off < EPS) break;
  }
  return Ak.map((row, i) => row[i]);
}

function _qrHouseholder(A: number[][]): { Q: number[][]; R: number[][] } {
  const m = A.length,
    n = A[0].length;
  let R = A.map((r) => r.slice());
  let Qt: number[][] = eye_poly(m);

  for (let k = 0; k < Math.min(m - 1, n); k++) {
    const x = R.slice(k).map((row) => row[k]);
    const xn = Math.sqrt(x.reduce((s, v) => s + v * v, 0));
    if (xn < 1e-14) continue;
    x[0] += Math.sign(x[0] || 1) * xn;
    const vn = Math.sqrt(x.reduce((s, v) => s + v * v, 0));
    const v = x.map((xi) => xi / vn);

    for (let j = k; j < n; j++) {
      let dot = 0;
      for (let i = 0; i < v.length; i++) dot += v[i] * R[k + i][j];
      for (let i = 0; i < v.length; i++) R[k + i][j] -= 2 * v[i] * dot;
    }
    for (let j = 0; j < m; j++) {
      let dot = 0;
      for (let i = 0; i < v.length; i++) dot += v[i] * Qt[k + i][j];
      for (let i = 0; i < v.length; i++) Qt[k + i][j] -= 2 * v[i] * dot;
    }
  }
  return { Q: Qt[0].map((_, ci) => Qt.map((row) => row[ci])), R };
}

function eye_poly(n: number): number[][] {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  );
}
