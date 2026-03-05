import Arithmetic from "./src/arithmetic";
import Comparison from "./src/comparison";
import Validation from "./src/validation";
import Conversion from "./src/conversion";
import Formatting from "./src/formatting";
import Currency from "./src/currency";
import Random from "./src/random";
import Statistics from "./src/statistics";
import Bitwise from "./src/bitwise";
import Trigonometry from "./src/trigonometry";
import Advanced from "./src/advanced";
import Financial from "./src/financial";
import Range from "./src/range";
import Sequences from "./src/sequences";
import NumberWords from "./src/number-words";
import Matrix from "./src/matrix";
import NDArray from "./src/ndarray";
import LinAlg from "./src/linalg";
import PolyModule, { Polynomial } from "./src/polynomial";
import Calculus from "./src/calculus";
import FFT from "./src/fft";
import Interpolation, { CubicSpline } from "./src/interpolation";
import Signal from "./src/signal";
import BigPrecision, { RoundingMode } from "./src/precision";

// ======================================
// CHAINABLE WRAPPER
// ======================================

interface NumWizOptions {
  safe?: boolean;
}

class NumWiz {
  value: number;
  private _safe: boolean;
  private _locale: string;
  private _system: "western" | "indian" | null;
  private _currency: string;

  constructor(value = 0, options: NumWizOptions = {}) {
    this._safe = options.safe || false;
    this.value = this._ensureNumber(value);
    this._locale = "en";
    this._system = null;
    this._currency = "USD";
  }

  // =====================
  // Internal Helpers
  // =====================

  private _ensureNumber(n: unknown): number {
    if (typeof n === "number" && !Number.isNaN(n)) return n as number;
    if (this._safe) return NaN;
    throw new TypeError(`Expected a valid number, got: ${n}`);
  }

  private _safeOp(fn: () => void): this {
    if (this._isNaN()) return this;
    try {
      fn();
    } catch (e) {
      if (this._safe) {
        this.value = NaN;
      } else {
        throw e;
      }
    }
    return this;
  }

  private _isNaN(): boolean {
    return Number.isNaN(this.value);
  }

  // =====================
  // Configuration (chainable)
  // =====================

  locale(code: string): this {
    this._locale = code;
    return this;
  }
  system(sys: "western" | "indian"): this {
    this._system = sys;
    return this;
  }
  currency(code: string): this {
    this._currency = code;
    return this;
  }

  safe(): this {
    this._safe = true;
    return this;
  }

  isValid(): boolean {
    return Number.isFinite(this.value);
  }

  // =====================
  // Arithmetic (chainable)
  // =====================

  add(n: number): this {
    return this._safeOp(() => {
      this.value += n;
    });
  }
  subtract(n: number): this {
    return this._safeOp(() => {
      this.value -= n;
    });
  }
  multiply(n: number): this {
    return this._safeOp(() => {
      this.value *= n;
    });
  }

  divide(n: number): this {
    return this._safeOp(() => {
      if (n === 0) throw new Error("Division by zero");
      this.value /= n;
    });
  }

  mod(n: number): this {
    return this._safeOp(() => {
      if (n === 0) throw new Error("Modulus by zero");
      this.value %= n;
    });
  }

  power(n: number): this {
    return this._safeOp(() => {
      this.value = Math.pow(this.value, n);
    });
  }

  sqrt(): this {
    return this._safeOp(() => {
      if (this.value < 0) throw new RangeError("sqrt of negative number");
      this.value = Math.sqrt(this.value);
    });
  }

  cbrt(): this {
    return this._safeOp(() => {
      this.value = Math.cbrt(this.value);
    });
  }
  abs(): this {
    return this._safeOp(() => {
      this.value = Math.abs(this.value);
    });
  }
  negate(): this {
    return this._safeOp(() => {
      this.value = -this.value;
    });
  }
  floor(): this {
    return this._safeOp(() => {
      this.value = Math.floor(this.value);
    });
  }
  ceil(): this {
    return this._safeOp(() => {
      this.value = Math.ceil(this.value);
    });
  }
  trunc(): this {
    return this._safeOp(() => {
      this.value = Math.trunc(this.value);
    });
  }

  round(decimals = 0): this {
    return this._safeOp(() => {
      const m = Math.pow(10, decimals);
      this.value = Math.round(this.value * m) / m;
    });
  }

  clamp(min: number, max: number): this {
    return this._safeOp(() => {
      this.value = Comparison.clamp(this.value, min, max);
    });
  }

  percent(p: number): this {
    return this._safeOp(() => {
      this.value = (this.value * p) / 100;
    });
  }

  // =====================
  // Output: Raw Value
  // =====================

  val(): number {
    return this.value;
  }
  result(): number {
    return this.value;
  }
  valueOf(): number {
    return this.value;
  }
  toString(): string {
    return String(this.value);
  }

  // =====================
  // Output: Formatting
  // =====================

  toFixed(d = 2): number {
    return Formatting.toFixed(this.value, d);
  }
  toCommas(): string {
    return Formatting.addCommas(this.value);
  }
  toIndianCommas(): string {
    return Formatting.addIndianCommas(this.value);
  }
  toRoman(): string {
    return Formatting.toRoman(this.value);
  }
  toFraction(maxDenom?: number): string {
    return Formatting.toFraction(this.value, maxDenom);
  }
  toScientific(d?: number): string {
    return Formatting.toScientific(this.value, d);
  }
  toEngineering(): string {
    return Formatting.toEngineering(this.value);
  }

  toPercentage(d = 2): string {
    return `${this.value.toFixed(d)}%`;
  }

  ratioToPercentage(d = 2): string {
    return Formatting.ratioToPercentage(this.value, d);
  }

  toOrdinal(): string {
    return Formatting.toOrdinal(this.value, this._locale);
  }

  // =====================
  // Output: Words
  // =====================

  toWords(): string {
    return Formatting.toWords(this.value, this._locale, this._system);
  }
  toWordsWestern(): string {
    return Formatting.toWordsWestern(this.value, this._locale);
  }
  toWordsIndian(): string {
    return Formatting.toWordsIndian(this.value, this._locale);
  }

  // =====================
  // Output: Abbreviation
  // =====================

  abbreviate(d = 1): string {
    return Formatting.abbreviate(this.value, d);
  }
  abbreviateIndian(d = 1): string {
    return Formatting.abbreviateIndian(this.value, d);
  }

  // =====================
  // Output: Currency
  // =====================

  toCurrency(curr?: string, loc?: string): string {
    return Currency.format(this.value, curr || this._currency, loc);
  }

  toCurrencyIndian(sym?: string): string {
    return Currency.formatIndian(
      this.value,
      sym || Currency.getSymbol(this._currency)
    );
  }

  toCurrencyWords(): string {
    return Currency.toWords(this.value, this._currency, this._locale);
  }

  toCurrencyWordsIndian(): string {
    return Currency.toWordsIndian(this.value, this._currency, this._locale);
  }

  toCurrencyAbbr(sym?: string): string {
    return Currency.abbreviateWestern(
      this.value,
      sym || Currency.getSymbol(this._currency)
    );
  }

  toCurrencyAbbrIndian(sym?: string): string {
    return Currency.abbreviateIndian(
      this.value,
      sym || Currency.getSymbol(this._currency)
    );
  }

  // =====================
  // Output: Conversion
  // =====================

  toBinary(): string {
    return Conversion.toBinary(this.value);
  }
  toOctal(): string {
    return Conversion.toOctal(this.value);
  }
  toHex(): string {
    return Conversion.toHex(this.value);
  }
  toBase(b: number): string {
    return Conversion.toBase(this.value, b);
  }

  // =====================
  // Output: Validation
  // =====================

  isEven(): boolean {
    return Validation.isEven(this.value);
  }
  isOdd(): boolean {
    return Validation.isOdd(this.value);
  }
  isPrime(): boolean {
    return Validation.isPrime(this.value);
  }
  isPositive(): boolean {
    return Validation.isPositive(this.value);
  }
  isNegative(): boolean {
    return Validation.isNegative(this.value);
  }
  isInteger(): boolean {
    return Validation.isInteger(this.value);
  }
  isPalindrome(): boolean {
    return Validation.isPalindrome(this.value);
  }
  isArmstrong(): boolean {
    return Validation.isArmstrong(this.value);
  }
  isPerfectNumber(): boolean {
    return Validation.isPerfectNumber(this.value);
  }
  isPowerOfTwo(): boolean {
    return Validation.isPowerOfTwo(this.value);
  }
  isFiniteNum(): boolean {
    return Validation.isFinite(this.value);
  }
}

// ======================================
// FACTORY FUNCTIONS
// ======================================

function numwiz(value: number): NumWiz {
  return new NumWiz(value);
}

numwiz.safe = (value: number): NumWiz => new NumWiz(value, { safe: true });

// ======================================
// EXPORTS
// ======================================

export {
  numwiz,
  NumWiz,
  Arithmetic,
  Comparison,
  Validation,
  Conversion,
  Formatting,
  Currency,
  Random,
  Statistics,
  Bitwise,
  Trigonometry,
  Advanced,
  Financial,
  Range,
  Sequences,
  NumberWords,
  Matrix,
  // Scientific computing modules
  NDArray,
  LinAlg,
  PolyModule,
  Polynomial,
  Calculus,
  FFT,
  Interpolation,
  CubicSpline,
  Signal,
  // Arbitrary precision
  BigPrecision,
  RoundingMode,
};

export default numwiz;
