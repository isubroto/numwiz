// =====================================================================
// Interpolation — 1-D interpolation methods for NumWiz
// =====================================================================

// ----------------------------------------------------------------
// Low-level 1D helpers
// ----------------------------------------------------------------

function _checkSorted(x: number[]): void {
  for (let i = 1; i < x.length; i++) {
    if (x[i] <= x[i - 1])
      throw new RangeError("xp must be strictly monotonically increasing");
  }
}

function _searchSorted(xp: number[], x: number): number {
  // Binary search: return index i such that xp[i-1] <= x < xp[i]
  let lo = 0,
    hi = xp.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (xp[mid] < x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

// =====================================================================
// CubicSpline class — natural cubic spline interpolator
// =====================================================================

export class CubicSpline {
  private xp: number[];
  private yp: number[];
  private c: number[]; // cubic coefficients a,b,c,d for each interval
  private d: number[];
  private a: number[];
  private b: number[];

  constructor(xp: number[], yp: number[]) {
    if (xp.length !== yp.length)
      throw new RangeError("xp and yp must have the same length");
    if (xp.length < 2)
      throw new RangeError("Need at least 2 points for spline");
    _checkSorted(xp);
    this.xp = xp.slice();
    this.yp = yp.slice();

    const [a, b, c, d] = _naturalCubicSpline(xp, yp);
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
  }

  /** Evaluate the spline at x (scalar or array). */
  evaluate(x: number): number;
  evaluate(x: number[]): number[];
  evaluate(x: number | number[]): number | number[] {
    if (Array.isArray(x)) return x.map((xi) => this._evalOne(xi));
    return this._evalOne(x as number);
  }

  /** First derivative at x. */
  derivative(x: number): number;
  derivative(x: number[]): number[];
  derivative(x: number | number[]): number | number[] {
    if (Array.isArray(x)) return x.map((xi) => this._derivOne(xi));
    return this._derivOne(x as number);
  }

  /** Second derivative at x. */
  secondDerivative(x: number): number;
  secondDerivative(x: number[]): number[];
  secondDerivative(x: number | number[]): number | number[] {
    if (Array.isArray(x)) return x.map((xi) => this._deriv2One(xi));
    return this._deriv2One(x as number);
  }

  /** Definite integral ∫ₐᵇ S(x) dx. */
  integral(a: number, b: number): number {
    const sign = a <= b ? 1 : -1;
    if (a > b) [a, b] = [b, a];
    let total = 0;
    for (let k = 0; k < this.xp.length - 1; k++) {
      const x0 = this.xp[k],
        x1 = this.xp[k + 1];
      if (b <= x0 || a >= x1) continue;
      const lo = Math.max(a, x0),
        hi = Math.min(b, x1);
      total += this._integralSegment(k, lo - x0, hi - x0);
    }
    return sign * total;
  }

  private _idx(x: number): number {
    const n = this.xp.length;
    if (x <= this.xp[0]) return 0;
    if (x >= this.xp[n - 1]) return n - 2;
    const i = _searchSorted(this.xp, x);
    return Math.min(i - 1, n - 2);
  }

  private _evalOne(x: number): number {
    const k = this._idx(x);
    const t = x - this.xp[k];
    return (
      this.a[k] + this.b[k] * t + this.c[k] * t * t + this.d[k] * t * t * t
    );
  }

  private _derivOne(x: number): number {
    const k = this._idx(x);
    const t = x - this.xp[k];
    return this.b[k] + 2 * this.c[k] * t + 3 * this.d[k] * t * t;
  }

  private _deriv2One(x: number): number {
    const k = this._idx(x);
    const t = x - this.xp[k];
    return 2 * this.c[k] + 6 * this.d[k] * t;
  }

  private _integralSegment(k: number, t0: number, t1: number): number {
    const { a, b, c, d } = this;
    const F = (t: number) =>
      a[k] * t +
      (b[k] / 2) * t ** 2 +
      (c[k] / 3) * t ** 3 +
      (d[k] / 4) * t ** 4;
    return F(t1) - F(t0);
  }
}

// ----------------------------------------------------------------
// Natural cubic spline coefficients (Thomas algorithm for tridiagonal)
// ----------------------------------------------------------------
function _naturalCubicSpline(
  xp: number[],
  yp: number[]
): [number[], number[], number[], number[]] {
  const n = xp.length;
  const h = Array.from({ length: n - 1 }, (_, i) => xp[i + 1] - xp[i]);
  // Right-hand side
  const rhs = Array.from(
    { length: n - 2 },
    (_, i) =>
      3 * ((yp[i + 2] - yp[i + 1]) / h[i + 1] - (yp[i + 1] - yp[i]) / h[i])
  );

  // Thomas algorithm for tridiagonal system
  const diag = Array.from({ length: n - 2 }, (_, i) => 2 * (h[i] + h[i + 1]));
  const lower = h.slice(1, n - 2);
  const upper = h.slice(1, n - 2);

  // Forward sweep
  const m = diag.slice();
  const r = rhs.slice();
  for (let i = 1; i < n - 2; i++) {
    const factor = lower[i - 1] / m[i - 1];
    m[i] -= factor * upper[i - 1];
    r[i] -= factor * r[i - 1];
  }
  // Back substitution
  const sigma = new Array<number>(n).fill(0); // natural spline: sigma[0]=sigma[n-1]=0
  sigma[n - 2 - 1 + 1] = r[n - 3] / m[n - 3];
  for (let i = n - 4; i >= 0; i--)
    sigma[i + 1] = (r[i] - upper[i] * sigma[i + 2]) / m[i];

  // Compute a, b, c, d
  const a = yp.slice(0, n - 1);
  const b: number[] = [];
  const c: number[] = [];
  const d: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    b.push(
      (yp[i + 1] - yp[i]) / h[i] - (h[i] * (2 * sigma[i] + sigma[i + 1])) / 3
    );
    c.push(sigma[i]);
    d.push((sigma[i + 1] - sigma[i]) / (3 * h[i]));
  }
  return [a, b, c, d];
}

// =====================================================================
// Interpolation module
// =====================================================================

const Interpolation = {
  /**
   * 1-D linear interpolation.
   * Equivalent to numpy.interp.
   * @param x  Point(s) to interpolate at
   * @param xp Known x-coordinates (must be strictly increasing)
   * @param yp Known y-coordinates
   */
  linear(x: number | number[], xp: number[], yp: number[]): number | number[] {
    if (xp.length !== yp.length)
      throw new RangeError("xp and yp must have same length");
    _checkSorted(xp);
    const interp1 = (xi: number): number => {
      if (xi <= xp[0]) return yp[0];
      if (xi >= xp[xp.length - 1]) return yp[yp.length - 1];
      const idx = _searchSorted(xp, xi);
      const i = idx - 1;
      const t = (xi - xp[i]) / (xp[i + 1] - xp[i]);
      return yp[i] + t * (yp[i + 1] - yp[i]);
    };
    if (Array.isArray(x)) return x.map(interp1);
    return interp1(x as number);
  },

  /**
   * Nearest-neighbor interpolation.
   */
  nearestNeighbor(
    x: number | number[],
    xp: number[],
    yp: number[]
  ): number | number[] {
    _checkSorted(xp);
    const nn1 = (xi: number): number => {
      if (xi <= xp[0]) return yp[0];
      if (xi >= xp[xp.length - 1]) return yp[yp.length - 1];
      const idx = _searchSorted(xp, xi);
      const i = idx - 1;
      return Math.abs(xi - xp[i]) <= Math.abs(xi - xp[idx]) ? yp[i] : yp[idx];
    };
    if (Array.isArray(x)) return x.map(nn1);
    return nn1(x as number);
  },

  /**
   * Lagrange polynomial interpolation.
   * Exact polynomial through all (xp, yp) points — can oscillate for large n.
   */
  polynomial(
    x: number | number[],
    xp: number[],
    yp: number[]
  ): number | number[] {
    const lagrange = (xi: number): number => {
      let result = 0;
      for (let i = 0; i < xp.length; i++) {
        let term = yp[i];
        for (let j = 0; j < xp.length; j++) {
          if (j !== i) term *= (xi - xp[j]) / (xp[i] - xp[j]);
        }
        result += term;
      }
      return result;
    };
    if (Array.isArray(x)) return x.map(lagrange);
    return lagrange(x as number);
  },

  /**
   * Cubic spline interpolation (natural boundary conditions).
   * Returns a CubicSpline object for repeated evaluation.
   */
  cubicSpline(xp: number[], yp: number[]): CubicSpline {
    return new CubicSpline(xp, yp);
  },

  /**
   * Piecewise cubic Hermite interpolation (PCHIP).
   * Preserves monotonicity unlike natural splines.
   */
  pchip(x: number | number[], xp: number[], yp: number[]): number | number[] {
    _checkSorted(xp);
    const n = xp.length;
    const h = Array.from({ length: n - 1 }, (_, i) => xp[i + 1] - xp[i]);
    const delta = Array.from(
      { length: n - 1 },
      (_, i) => (yp[i + 1] - yp[i]) / h[i]
    );

    // Estimate slopes using Fritsch-Carlson method
    const m = new Array<number>(n).fill(0);
    for (let i = 1; i < n - 1; i++) {
      if (delta[i - 1] * delta[i] <= 0) {
        m[i] = 0;
      } else {
        const w1 = 2 * h[i] + h[i - 1],
          w2 = h[i] + 2 * h[i - 1];
        m[i] = (w1 + w2) / (w1 / delta[i - 1] + w2 / delta[i]);
      }
    }
    m[0] = _pchipEnd(h[0], h[1], delta[0], delta[1]);
    m[n - 1] = _pchipEnd(h[n - 2], h[n - 3], delta[n - 2], delta[n - 3]);

    const eval1 = (xi: number): number => {
      if (xi <= xp[0]) return yp[0];
      if (xi >= xp[n - 1]) return yp[n - 1];
      const idx = _searchSorted(xp, xi) - 1;
      const t = (xi - xp[idx]) / h[idx];
      const h00 = 2 * t * t * t - 3 * t * t + 1;
      const h10 = t * t * t - 2 * t * t + t;
      const h01 = -2 * t * t * t + 3 * t * t;
      const h11 = t * t * t - t * t;
      return (
        h00 * yp[idx] +
        h10 * h[idx] * m[idx] +
        h01 * yp[idx + 1] +
        h11 * h[idx] * m[idx + 1]
      );
    };
    if (Array.isArray(x)) return x.map(eval1);
    return eval1(x as number);
  },

  /**
   * 2-D bilinear interpolation.
   * @param x   Query x (column)
   * @param y   Query y (row)
   * @param xgrid Sorted x grid points
   * @param ygrid Sorted y grid points
   * @param z   Grid values z[iy][ix]
   */
  bilinear(
    x: number,
    y: number,
    xgrid: number[],
    ygrid: number[],
    z: number[][]
  ): number {
    const nx = xgrid.length,
      ny = ygrid.length;
    const ix = Math.min(Math.max(_searchSorted(xgrid, x) - 1, 0), nx - 2);
    const iy = Math.min(Math.max(_searchSorted(ygrid, y) - 1, 0), ny - 2);
    const tx = (x - xgrid[ix]) / (xgrid[ix + 1] - xgrid[ix]);
    const ty = (y - ygrid[iy]) / (ygrid[iy + 1] - ygrid[iy]);
    return (
      z[iy][ix] * (1 - tx) * (1 - ty) +
      z[iy][ix + 1] * tx * (1 - ty) +
      z[iy + 1][ix] * (1 - tx) * ty +
      z[iy + 1][ix + 1] * tx * ty
    );
  },

  /**
   * Quick interpolation using a CubicSpline object — for API parity.
   */
  interp(
    x: number | number[],
    xp: number[],
    yp: number[],
    kind: "linear" | "nearest" | "cubic" | "pchip" = "linear"
  ): number | number[] {
    if (kind === "linear") return Interpolation.linear(x, xp, yp);
    if (kind === "nearest") return Interpolation.nearestNeighbor(x, xp, yp);
    if (kind === "pchip") return Interpolation.pchip(x, xp, yp);
    if (kind === "cubic") {
      const spline = new CubicSpline(xp, yp);
      if (Array.isArray(x)) return spline.evaluate(x);
      return spline.evaluate(x as number);
    }
    throw new Error(`Unknown interpolation kind: ${kind}`);
  },

  CubicSpline,
};

function _pchipEnd(h1: number, h2: number, d1: number, d2: number): number {
  const m = ((2 * h1 + h2) * d1 - h1 * d2) / (h1 + h2);
  if (Math.sign(m) !== Math.sign(d1)) return 0;
  if (Math.sign(d1) !== Math.sign(d2) && Math.abs(m) > 3 * Math.abs(d1))
    return 3 * d1;
  return m;
}

export default Interpolation;
