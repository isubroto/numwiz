import Decimal from "decimal.js";

/**
 * Rounding modes matching Python's decimal module and decimal.js names.
 * These are plain numeric constants mirroring Decimal.ROUND_* values.
 */
export const RoundingMode = {
  /** Round away from zero */
  ROUND_UP: Decimal.ROUND_UP,
  /** Round towards zero (truncate) */
  ROUND_DOWN: Decimal.ROUND_DOWN,
  /** Round towards +Infinity */
  ROUND_CEIL: Decimal.ROUND_CEIL,
  /** Round towards -Infinity */
  ROUND_FLOOR: Decimal.ROUND_FLOOR,
  /** Round to nearest, ties go away from zero (Python default) */
  ROUND_HALF_UP: Decimal.ROUND_HALF_UP,
  /** Round to nearest, ties go toward zero */
  ROUND_HALF_DOWN: Decimal.ROUND_HALF_DOWN,
  /** Round to nearest, ties go to nearest even digit (banker's rounding) */
  ROUND_HALF_EVEN: Decimal.ROUND_HALF_EVEN,
} as const;

export type RoundingMode = (typeof RoundingMode)[keyof typeof RoundingMode];

export type PrecisionInput = string | number | Decimal | BigPrecision;

/**
 * Arbitrary-precision decimal arithmetic — analogous to Python's decimal.Decimal.
 *
 * Uses decimal.js under the hood for correct decimal representation.
 *
 * @example
 * const a = new BigPrecision("1.1");
 * const b = new BigPrecision("2.2");
 * a.add(b).toString(); // "3.3" (not "3.3000000000000003")
 *
 * // High precision
 * BigPrecision.setPrecision(50);
 * BigPrecision.pi().toString(); // 50-digit π
 */
class BigPrecision {
  private readonly _d: Decimal;

  constructor(value: PrecisionInput) {
    if (value instanceof BigPrecision) {
      this._d = value._d;
    } else {
      this._d = new Decimal(value as string | number | Decimal);
    }
  }

  // =========================================================
  // Configuration
  // =========================================================

  /**
   * Set the global precision (significant digits) for all BigPrecision operations.
   * Default is 20. Analogous to Python's `decimal.getcontext().prec = n`.
   */
  static setPrecision(digits: number): void {
    Decimal.set({ precision: digits });
  }

  /** Get the current global precision. */
  static getPrecision(): number {
    return Decimal.precision;
  }

  /**
   * Set the global rounding mode.
   * Default is ROUND_HALF_UP.
   */
  static setRoundingMode(mode: RoundingMode): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Decimal.set({ rounding: mode as any });
  }

  // =========================================================
  // Arithmetic
  // =========================================================

  /** Addition */
  add(other: PrecisionInput): BigPrecision {
    return new BigPrecision(this._d.plus(BigPrecision._toDecimal(other)));
  }

  /** Subtraction */
  sub(other: PrecisionInput): BigPrecision {
    return new BigPrecision(this._d.minus(BigPrecision._toDecimal(other)));
  }

  /** Multiplication */
  mul(other: PrecisionInput): BigPrecision {
    return new BigPrecision(this._d.times(BigPrecision._toDecimal(other)));
  }

  /** Division */
  div(other: PrecisionInput): BigPrecision {
    const d = BigPrecision._toDecimal(other);
    if (d.isZero()) throw new Error("Division by zero");
    return new BigPrecision(this._d.dividedBy(d));
  }

  /** Modulo */
  mod(other: PrecisionInput): BigPrecision {
    const d = BigPrecision._toDecimal(other);
    if (d.isZero()) throw new Error("Division by zero");
    return new BigPrecision(this._d.mod(d));
  }

  /** Exponentiation */
  pow(exp: PrecisionInput): BigPrecision {
    return new BigPrecision(this._d.pow(BigPrecision._toDecimal(exp)));
  }

  /** Absolute value */
  abs(): BigPrecision {
    return new BigPrecision(this._d.abs());
  }

  /** Negation */
  neg(): BigPrecision {
    return new BigPrecision(this._d.neg());
  }

  /** Reciprocal (1 / this) */
  reciprocal(): BigPrecision {
    if (this._d.isZero()) throw new Error("Reciprocal of zero");
    return new BigPrecision(new Decimal(1).dividedBy(this._d));
  }

  // =========================================================
  // Mathematical Functions
  // =========================================================

  /** Square root */
  sqrt(): BigPrecision {
    if (this._d.isNegative()) throw new RangeError("sqrt of negative number");
    return new BigPrecision(this._d.sqrt());
  }

  /** Cube root */
  cbrt(): BigPrecision {
    return new BigPrecision(this._d.cbrt());
  }

  /** Natural logarithm ln(x) */
  ln(): BigPrecision {
    if (this._d.lte(0)) throw new RangeError("ln requires positive number");
    return new BigPrecision(this._d.ln());
  }

  /** Base-10 logarithm */
  log10(): BigPrecision {
    if (this._d.lte(0)) throw new RangeError("log10 requires positive number");
    return new BigPrecision(this._d.log(10));
  }

  /** Base-2 logarithm */
  log2(): BigPrecision {
    if (this._d.lte(0)) throw new RangeError("log2 requires positive number");
    return new BigPrecision(this._d.log(2));
  }

  /** Logarithm with arbitrary base */
  log(base: PrecisionInput): BigPrecision {
    const b = BigPrecision._toDecimal(base);
    if (b.lte(0) || b.eq(1))
      throw new RangeError("log base must be > 0 and ≠ 1");
    if (this._d.lte(0)) throw new RangeError("log requires positive number");
    return new BigPrecision(this._d.log(b));
  }

  /** e raised to the power of this */
  exp(): BigPrecision {
    return new BigPrecision(this._d.exp());
  }

  // =========================================================
  // Rounding / Quantize
  // =========================================================

  /**
   * Round to a specific number of decimal places.
   * Analogous to Python's `Decimal.quantize(Decimal('0.01'))`.
   *
   * @param decimalPlaces - number of decimal places to keep
   * @param mode - rounding mode (default: ROUND_HALF_UP)
   */
  quantize(
    decimalPlaces: number,
    mode: RoundingMode = RoundingMode.ROUND_HALF_UP
  ): BigPrecision {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new BigPrecision(
      this._d.toDecimalPlaces(decimalPlaces, mode as any)
    );
  }

  /**
   * Round to a specific number of significant digits.
   *
   * @param sigDigits - significant digits to keep
   * @param mode - rounding mode (default: ROUND_HALF_UP)
   */
  toPrecision(
    sigDigits: number,
    mode: RoundingMode = RoundingMode.ROUND_HALF_UP
  ): BigPrecision {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return new BigPrecision(
      this._d.toSignificantDigits(sigDigits, mode as any)
    );
  }

  /** Ceiling: smallest integer >= this */
  ceil(): BigPrecision {
    return new BigPrecision(this._d.ceil());
  }

  /** Floor: largest integer <= this */
  floor(): BigPrecision {
    return new BigPrecision(this._d.floor());
  }

  /** Truncate toward zero */
  trunc(): BigPrecision {
    return new BigPrecision(this._d.trunc());
  }

  // =========================================================
  // Comparison
  // =========================================================

  equals(other: PrecisionInput): boolean {
    return this._d.equals(BigPrecision._toDecimal(other));
  }

  gt(other: PrecisionInput): boolean {
    return this._d.greaterThan(BigPrecision._toDecimal(other));
  }

  gte(other: PrecisionInput): boolean {
    return this._d.greaterThanOrEqualTo(BigPrecision._toDecimal(other));
  }

  lt(other: PrecisionInput): boolean {
    return this._d.lessThan(BigPrecision._toDecimal(other));
  }

  lte(other: PrecisionInput): boolean {
    return this._d.lessThanOrEqualTo(BigPrecision._toDecimal(other));
  }

  /** Returns -1, 0, or 1 */
  compareTo(other: PrecisionInput): -1 | 0 | 1 {
    return this._d.comparedTo(BigPrecision._toDecimal(other)) as -1 | 0 | 1;
  }

  isZero(): boolean {
    return this._d.isZero();
  }

  isNegative(): boolean {
    return this._d.isNegative();
  }

  isPositive(): boolean {
    return this._d.isPositive();
  }

  isInteger(): boolean {
    return this._d.isInteger();
  }

  isFinite(): boolean {
    return this._d.isFinite();
  }

  isNaN(): boolean {
    return this._d.isNaN();
  }

  // =========================================================
  // Conversion
  // =========================================================

  /** Convert to JavaScript float (may lose precision) */
  toNumber(): number {
    return this._d.toNumber();
  }

  /**
   * Returns exact decimal string representation.
   * Analogous to `str(Decimal('...'))` in Python.
   */
  toString(): string {
    return this._d.toString();
  }

  /**
   * Returns string with fixed number of decimal places.
   */
  toFixed(decimalPlaces: number): string {
    return this._d.toFixed(decimalPlaces);
  }

  /**
   * Returns string with given number of significant digits.
   */
  toSignificantDigits(sigDigits: number): string {
    return this._d.toSignificantDigits(sigDigits).toString();
  }

  /** Expose the underlying decimal.js Decimal instance */
  toDecimal(): Decimal {
    return this._d;
  }

  // =========================================================
  // Static Utilities
  // =========================================================

  /**
   * Returns a BigPrecision representing π computed to at least the current precision.
   */
  static pi(): BigPrecision {
    // decimal.js does not provide a built-in pi; use acos(-1) workaround
    // atan(1)*4 is available via decimal.js
    return new BigPrecision(Decimal.acos(-1));
  }

  /**
   * Returns a BigPrecision representing e = exp(1).
   */
  static e(): BigPrecision {
    return new BigPrecision(new Decimal(1).exp());
  }

  /** Maximum of multiple BigPrecision values */
  static max(...values: PrecisionInput[]): BigPrecision {
    if (values.length === 0)
      throw new Error("max requires at least one argument");
    return values
      .map((v) => new BigPrecision(v))
      .reduce((a, b) => (a.gt(b) ? a : b));
  }

  /** Minimum of multiple BigPrecision values */
  static min(...values: PrecisionInput[]): BigPrecision {
    if (values.length === 0)
      throw new Error("min requires at least one argument");
    return values
      .map((v) => new BigPrecision(v))
      .reduce((a, b) => (a.lt(b) ? a : b));
  }

  /** Sum of an array of BigPrecision values */
  static sum(values: PrecisionInput[]): BigPrecision {
    return values.reduce<BigPrecision>(
      (acc, v) => acc.add(v),
      new BigPrecision(0)
    );
  }

  // =========================================================
  // Internal Helper
  // =========================================================

  private static _toDecimal(v: PrecisionInput): Decimal {
    if (v instanceof BigPrecision) return v._d;
    return new Decimal(v as string | number | Decimal);
  }
}

export default BigPrecision;
