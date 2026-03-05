/**
 * Trigonometry & Logarithmic Operations
 */
class Trigonometry {
  // =====================
  // Mathematical Constants
  // =====================

  /** π ≈ 3.14159265358979 */
  static readonly PI: number = Math.PI;
  /** Euler's number e ≈ 2.71828182845905 */
  static readonly E: number = Math.E;
  /** τ = 2π ≈ 6.28318530717959 */
  static readonly TAU: number = 2 * Math.PI;
  /** Golden ratio φ ≈ 1.61803398874989 */
  static readonly PHI: number = (1 + Math.sqrt(5)) / 2;
  /** √2 ≈ 1.41421356237310 */
  static readonly SQRT2: number = Math.SQRT2;
  /** ln(2) ≈ 0.69314718055995 */
  static readonly LN2: number = Math.LN2;
  /** ln(10) ≈ 2.30258509299405 */
  static readonly LN10: number = Math.LN10;
  /** log₂(e) ≈ 1.44269504088896 */
  static readonly LOG2E: number = Math.LOG2E;
  /** log₁₀(e) ≈ 0.43429448190325 */
  static readonly LOG10E: number = Math.LOG10E;

  // =====================
  // Basic Trig
  // =====================

  static sin(angle: number): number {
    return Math.sin(angle);
  }
  static cos(angle: number): number {
    return Math.cos(angle);
  }
  static tan(angle: number): number {
    return Math.tan(angle);
  }

  // =====================
  // Inverse Trig
  // =====================

  static asin(value: number): number {
    if (value < -1 || value > 1)
      throw new RangeError("asin input must be between -1 and 1");
    return Math.asin(value);
  }

  static acos(value: number): number {
    if (value < -1 || value > 1)
      throw new RangeError("acos input must be between -1 and 1");
    return Math.acos(value);
  }

  static atan(value: number): number {
    return Math.atan(value);
  }
  static atan2(y: number, x: number): number {
    return Math.atan2(y, x);
  }

  // =====================
  // Hyperbolic
  // =====================

  static sinh(angle: number): number {
    return Math.sinh(angle);
  }
  static cosh(angle: number): number {
    return Math.cosh(angle);
  }
  static tanh(angle: number): number {
    return Math.tanh(angle);
  }
  static asinh(value: number): number {
    return Math.asinh(value);
  }
  static acosh(value: number): number {
    if (value < 1) throw new RangeError("acosh input must be >= 1");
    return Math.acosh(value);
  }
  static atanh(value: number): number {
    if (value <= -1 || value >= 1)
      throw new RangeError("atanh input must be between -1 and 1 (exclusive)");
    return Math.atanh(value);
  }

  // =====================
  // Reciprocal Trig
  // =====================

  static sec(angle: number): number {
    const c = Math.cos(angle);
    if (c === 0) throw new Error("sec undefined (cos = 0)");
    return 1 / c;
  }

  static csc(angle: number): number {
    const s = Math.sin(angle);
    if (s === 0) throw new Error("csc undefined (sin = 0)");
    return 1 / s;
  }

  static cot(angle: number): number {
    const t = Math.tan(angle);
    if (t === 0) throw new Error("cot undefined (tan = 0)");
    return 1 / t;
  }

  // =====================
  // Angle Conversion
  // =====================

  static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
  static toDegrees(radians: number): number {
    return (radians * 180) / Math.PI;
  }
  static normalizeDegrees(degrees: number): number {
    return ((degrees % 360) + 360) % 360;
  }
  static normalizeRadians(radians: number): number {
    return ((radians % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  }

  // =====================
  // Triangle Helpers
  // =====================

  static hypot(...values: number[]): number {
    return Math.hypot(...values);
  }

  static lawOfCosinesSide(a: number, b: number, angleC: number): number {
    return Math.sqrt(a * a + b * b - 2 * a * b * Math.cos(angleC));
  }

  static lawOfCosinesAngle(a: number, b: number, c: number): number {
    const cosC = (a * a + b * b - c * c) / (2 * a * b);
    if (cosC < -1 || cosC > 1) throw new RangeError("Invalid triangle sides");
    return Math.acos(cosC);
  }

  static lawOfSinesSide(sideA: number, angleA: number, angleB: number): number {
    const sinA = Math.sin(angleA);
    if (sinA === 0) throw new Error("sin(angleA) cannot be 0");
    return (sideA * Math.sin(angleB)) / sinA;
  }

  static lawOfSinesAngle(sideA: number, sideB: number, angleA: number): number {
    const sinB = (sideB * Math.sin(angleA)) / sideA;
    if (sinB < -1 || sinB > 1) throw new RangeError("No valid triangle");
    return Math.asin(sinB);
  }

  static triangleArea(a: number, b: number, angleC: number): number {
    return 0.5 * a * b * Math.sin(angleC);
  }

  // =====================
  // Logarithms
  // =====================

  static log(n: number): number {
    if (n <= 0) throw new RangeError("log input must be positive");
    return Math.log(n);
  }

  static log2(n: number): number {
    if (n <= 0) throw new RangeError("log2 input must be positive");
    return Math.log2(n);
  }

  static log10(n: number): number {
    if (n <= 0) throw new RangeError("log10 input must be positive");
    return Math.log10(n);
  }

  static logN(n: number, base: number): number {
    if (n <= 0 || base <= 0 || base === 1) {
      throw new RangeError(
        "logN: n must be positive, base must be positive and ≠ 1"
      );
    }
    return Math.log(n) / Math.log(base);
  }

  static exp(n: number): number {
    return Math.exp(n);
  }
  static log1p(n: number): number {
    return Math.log1p(n);
  }
  static expm1(n: number): number {
    return Math.expm1(n);
  }
}

export default Trigonometry;
