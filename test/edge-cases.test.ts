import {
  Arithmetic,
  BigPrecision,
  Calculus,
  Currency,
  FFT,
  Financial,
  Formatting,
  Interpolation,
  LinAlg,
  Matrix,
  NDArray,
  Polynomial,
  Range,
  Signal,
  Statistics,
  Validation,
} from "../index";

describe("edge cases and diagnostic errors", () => {
  test("error messages include module, method, expected input, and received input", () => {
    expect(() => Arithmetic.divide(1, 0)).toThrow(
      /\[NumWiz\.Arithmetic\.divide\].*Expected:.*Received: 0/
    );
    expect(() => Matrix.determinant([[1, 2, 3]])).toThrow(
      /\[NumWiz\.Matrix\.determinant\].*Expected:/
    );
    expect(() => NDArray.from([1, 2]).divide(0)).toThrow(
      /\[NumWiz\.NDArray\.divide\].*Received: 0/
    );
  });

  test("empty input is handled explicitly", () => {
    expect(Statistics.sum([])).toBe(0);
    expect(() => Statistics.mean([])).toThrow(
      /\[NumWiz\.Statistics\.mean\]/
    );
    expect(Calculus.gradient([])).toEqual([]);
    expect(FFT.fft([])).toEqual([]);
    expect(Signal.convolve([], [])).toEqual([]);
  });

  test("NaN and Infinity are rejected where finite numbers are required", () => {
    expect(() => Arithmetic.add(1, Number.NaN)).toThrow(
      /\[NumWiz\.Arithmetic\.validateNumbers\]/
    );
    expect(() => Statistics.mean([1, Infinity])).toThrow(
      /\[NumWiz\.Statistics\.mean\]/
    );
    expect(() => Matrix.create(2, Infinity)).toThrow(
      /\[NumWiz\.Matrix\.dimensions\]/
    );
    expect(() => Currency.format(Infinity, "USD")).toThrow(
      /\[NumWiz\.Currency\.format\]/
    );
    expect(() => Formatting.toWords(Infinity)).toThrow(RangeError);
  });

  test("reviewed scalar edge cases stay finite and bounded", () => {
    expect(() => Range.create(1, 3, 0)).toThrow(RangeError);
    expect(Arithmetic.nthRoot(-8, 3)).toBe(-2);
    expect(Validation.isPowerOfTwo(4294967297)).toBe(false);
    expect(Formatting.toEngineering(0)).toBe("0×10^0");
    expect(Financial.emi(1200, 0, 12)).toBe(100);
    expect(Financial.sipFutureValue(100, 0, 2)).toBe(2400);
  });

  test("zero division is explicit across number, array, and precision APIs", () => {
    expect(() => Arithmetic.divide(1, 0)).toThrow(/division by zero/);
    expect(() => NDArray.from([1, 2]).divide(0)).toThrow(/division by zero/);
    expect(() => new BigPrecision("1").div("0")).toThrow(/Division by zero/);
  });

  test("shape mismatch and invalid dimensions fail with useful diagnostics", () => {
    expect(() => Matrix.add([[1, 2]], [[1], [2]])).toThrow(
      /\[NumWiz\.Matrix\.add\]/
    );
    expect(() => NDArray.from([1, 2, 3]).reshape([2, 2])).toThrow(
      /Cannot reshape/
    );
    expect(() => new NDArray([1, 2, 3], [2, 2])).toThrow(
      /\[NumWiz\.NDArray\.constructor\]/
    );
    expect(() => LinAlg.solve([[1, 2]], [1])).toThrow(/square matrix/);
  });

  test("invalid locale and currency inputs are contextualized", () => {
    expect(() => Currency.format(100, "USD", "not a locale")).toThrow(
      /\[NumWiz\.Currency\.format\]/
    );
    expect(() => Currency.format(100, "NOT_A_CODE", "en-US")).toThrow(
      /\[NumWiz\.Currency\.format\]/
    );
    expect(() => Currency.convert(100, 0, 110)).toThrow(
      /\[NumWiz\.Currency\.convert\]/
    );
  });

  test("very large and very small numbers keep documented precision behavior", () => {
    expect(Arithmetic.multiply(1e308, 1e10)).toBe(Infinity);
    expect(Arithmetic.divide(Number.MIN_VALUE, 2)).toBe(0);
    expect(new BigPrecision("1e308").mul("1e10").toString()).toBe("1e+318");
    expect(new BigPrecision(String(Number.MIN_VALUE)).div("2").toString()).toBe(
      "2.5e-324"
    );
  });

  test("interpolation, signal, and polynomial reject invalid inputs", () => {
    expect(() => Interpolation.linear(1, [0, 0], [1, 2])).toThrow(
      /monotonically increasing/
    );
    expect(() => Signal.movingAverage([1, 2], 0)).toThrow(/Invalid window size/);
    expect(() => new Polynomial([1]).divide(Polynomial.zero())).toThrow(
      /zero polynomial/
    );
  });
});
