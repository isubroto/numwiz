import BigPrecision, { RoundingMode } from "../src/precision";

// Reset precision before each test to avoid state leakage
beforeEach(() => {
  BigPrecision.setPrecision(20);
  BigPrecision.setRoundingMode(RoundingMode.ROUND_HALF_UP);
});

describe("BigPrecision — Construction", () => {
  test("creates from integer", () => {
    expect(new BigPrecision(42).toString()).toBe("42");
  });

  test("creates from float", () => {
    expect(new BigPrecision(3.14).toString()).toBe("3.14");
  });

  test("creates from string", () => {
    expect(new BigPrecision("1.23456789012345678901").toString()).toBe(
      "1.23456789012345678901"
    );
  });

  test("creates from another BigPrecision", () => {
    const a = new BigPrecision("9.99");
    const b = new BigPrecision(a);
    expect(b.toString()).toBe("9.99");
  });

  test("avoids floating-point error: 0.1 + 0.2", () => {
    const result = new BigPrecision("0.1").add("0.2");
    expect(result.toString()).toBe("0.3");
  });
});

describe("BigPrecision — Arithmetic", () => {
  test("add two numbers", () => {
    expect(new BigPrecision("1.5").add("2.5").toString()).toBe("4");
  });

  test("add with BigPrecision instance", () => {
    const a = new BigPrecision("10");
    const b = new BigPrecision("3.5");
    expect(a.add(b).toString()).toBe("13.5");
  });

  test("subtract", () => {
    expect(new BigPrecision("10").sub("3").toString()).toBe("7");
  });

  test("multiply", () => {
    expect(new BigPrecision("1.1").mul("3").toString()).toBe("3.3");
  });

  test("divide", () => {
    expect(new BigPrecision("10").div("4").toString()).toBe("2.5");
  });

  test("divide throws on zero denominator", () => {
    expect(() => new BigPrecision("5").div(0)).toThrow("Division by zero");
  });

  test("modulo", () => {
    expect(new BigPrecision("10").mod("3").toString()).toBe("1");
  });

  test("modulo throws on zero divisor", () => {
    expect(() => new BigPrecision("5").mod(0)).toThrow("Division by zero");
  });

  test("power: 2^10", () => {
    expect(new BigPrecision("2").pow("10").toString()).toBe("1024");
  });

  test("power: fractional exponent", () => {
    const result = new BigPrecision("4").pow("0.5");
    expect(parseFloat(result.toFixed(10))).toBeCloseTo(2, 9);
  });

  test("abs of negative", () => {
    expect(new BigPrecision("-7.5").abs().toString()).toBe("7.5");
  });

  test("negate", () => {
    expect(new BigPrecision("3").neg().toString()).toBe("-3");
  });

  test("reciprocal of 4", () => {
    expect(new BigPrecision("4").reciprocal().toString()).toBe("0.25");
  });

  test("reciprocal throws on zero", () => {
    expect(() => new BigPrecision("0").reciprocal()).toThrow(
      "Reciprocal of zero"
    );
  });
});

describe("BigPrecision — Mathematical Functions", () => {
  test("sqrt(9) = 3", () => {
    expect(new BigPrecision("9").sqrt().toString()).toBe("3");
  });

  test("sqrt(2) high precision", () => {
    BigPrecision.setPrecision(30);
    const result = new BigPrecision("2").sqrt().toString();
    // sqrt(2) = 1.41421356237309504880168872420969...
    // use first 27 significant digits to avoid last-digit rounding variance
    expect(result.startsWith("1.41421356237309504880168872")).toBe(true);
  });

  test("sqrt throws on negative", () => {
    expect(() => new BigPrecision("-1").sqrt()).toThrow("sqrt of negative");
  });

  test("cbrt(27) = 3", () => {
    const result = new BigPrecision("27").cbrt();
    expect(parseFloat(result.toFixed(10))).toBeCloseTo(3, 9);
  });

  test("ln(1) = 0", () => {
    const result = new BigPrecision("1").ln();
    expect(result.toString()).toBe("0");
  });

  test("ln(e) ≈ 1", () => {
    const e = BigPrecision.e();
    const result = e.ln();
    expect(parseFloat(result.toFixed(15))).toBeCloseTo(1, 14);
  });

  test("ln throws on non-positive", () => {
    expect(() => new BigPrecision("0").ln()).toThrow();
    expect(() => new BigPrecision("-1").ln()).toThrow();
  });

  test("log10(100) = 2", () => {
    const result = new BigPrecision("100").log10();
    expect(parseFloat(result.toFixed(10))).toBeCloseTo(2, 9);
  });

  test("log10 throws on non-positive", () => {
    expect(() => new BigPrecision("0").log10()).toThrow();
  });

  test("log2(8) = 3", () => {
    const result = new BigPrecision("8").log2();
    expect(parseFloat(result.toFixed(10))).toBeCloseTo(3, 9);
  });

  test("log(base 10, 1000) = 3", () => {
    const result = new BigPrecision("1000").log(10);
    expect(parseFloat(result.toFixed(10))).toBeCloseTo(3, 9);
  });

  test("log throws on bad base", () => {
    expect(() => new BigPrecision("8").log(1)).toThrow();
    expect(() => new BigPrecision("8").log(0)).toThrow();
  });

  test("exp(0) = 1", () => {
    expect(new BigPrecision("0").exp().toString()).toBe("1");
  });

  test("exp(1) ≈ 2.71828...", () => {
    const e = new BigPrecision("1").exp();
    expect(e.toString().startsWith("2.71828")).toBe(true);
  });
});

describe("BigPrecision — Rounding / Quantize", () => {
  test("quantize to 2 dp (ROUND_HALF_UP)", () => {
    expect(new BigPrecision("1.005").quantize(2).toString()).toBe("1.01");
  });

  test("quantize to 2 dp (ROUND_DOWN)", () => {
    expect(
      new BigPrecision("1.999").quantize(2, RoundingMode.ROUND_DOWN).toString()
    ).toBe("1.99");
  });

  test("quantize to 2 dp (ROUND_FLOOR on negative)", () => {
    expect(
      new BigPrecision("-1.001")
        .quantize(2, RoundingMode.ROUND_FLOOR)
        .toString()
    ).toBe("-1.01");
  });

  test("quantize to 2 dp (ROUND_HALF_EVEN — banker's rounding)", () => {
    // 2.5 rounds to 2 (ties go to even)
    const result = new BigPrecision("2.5")
      .quantize(0, RoundingMode.ROUND_HALF_EVEN)
      .toString();
    expect(result).toBe("2");
  });

  test("ceil", () => {
    expect(new BigPrecision("1.1").ceil().toString()).toBe("2");
    expect(new BigPrecision("-1.1").ceil().toString()).toBe("-1");
  });

  test("floor", () => {
    expect(new BigPrecision("1.9").floor().toString()).toBe("1");
    expect(new BigPrecision("-1.1").floor().toString()).toBe("-2");
  });

  test("trunc", () => {
    expect(new BigPrecision("1.9").trunc().toString()).toBe("1");
    expect(new BigPrecision("-1.9").trunc().toString()).toBe("-1");
  });

  test("toPrecision 3 sig digits", () => {
    const result = new BigPrecision("1.23456").toPrecision(3).toString();
    expect(result).toBe("1.23");
  });
});

describe("BigPrecision — Comparison", () => {
  test("equals", () => {
    expect(new BigPrecision("1.0").equals("1")).toBe(true);
    expect(new BigPrecision("1.0").equals("1.1")).toBe(false);
  });

  test("gt / lt / gte / lte", () => {
    const a = new BigPrecision("3");
    const b = new BigPrecision("2");
    expect(a.gt(b)).toBe(true);
    expect(b.lt(a)).toBe(true);
    expect(a.gte("3")).toBe(true);
    expect(b.lte("2")).toBe(true);
  });

  test("compareTo returns -1, 0, 1", () => {
    const a = new BigPrecision("5");
    expect(a.compareTo("5")).toBe(0);
    expect(a.compareTo("4")).toBe(1);
    expect(a.compareTo("6")).toBe(-1);
  });

  test("isZero", () => {
    expect(new BigPrecision(0).isZero()).toBe(true);
    expect(new BigPrecision("0.001").isZero()).toBe(false);
  });

  test("isNegative / isPositive", () => {
    expect(new BigPrecision("-5").isNegative()).toBe(true);
    expect(new BigPrecision("5").isPositive()).toBe(true);
    expect(new BigPrecision(0).isNegative()).toBe(false);
  });

  test("isInteger", () => {
    expect(new BigPrecision("4").isInteger()).toBe(true);
    expect(new BigPrecision("4.5").isInteger()).toBe(false);
  });

  test("isFinite / isNaN", () => {
    expect(new BigPrecision("99").isFinite()).toBe(true);
    expect(new BigPrecision("99").isNaN()).toBe(false);
  });
});

describe("BigPrecision — Conversion", () => {
  test("toNumber()", () => {
    expect(new BigPrecision("3.14").toNumber()).toBeCloseTo(3.14);
  });

  test("toFixed(4)", () => {
    expect(new BigPrecision("3.14159265").toFixed(4)).toBe("3.1416");
  });

  test("toSignificantDigits(5)", () => {
    expect(new BigPrecision("3.14159265").toSignificantDigits(5)).toBe(
      "3.1416"
    );
  });
});

describe("BigPrecision — Static Utilities", () => {
  test("pi() has correct first 15 digits", () => {
    BigPrecision.setPrecision(20);
    const pi = BigPrecision.pi().toString();
    expect(pi.startsWith("3.14159265358979")).toBe(true);
  });

  test("e() has correct first 10 digits", () => {
    const e = BigPrecision.e().toString();
    expect(e.startsWith("2.718281828")).toBe(true);
  });

  test("max()", () => {
    expect(BigPrecision.max("1", "5", "3").toString()).toBe("5");
  });

  test("max() with single value", () => {
    expect(BigPrecision.max("7").toString()).toBe("7");
  });

  test("max() throws on empty", () => {
    expect(() => BigPrecision.max()).toThrow();
  });

  test("min()", () => {
    expect(BigPrecision.min("10", "2", "8").toString()).toBe("2");
  });

  test("sum()", () => {
    const result = BigPrecision.sum(["1.1", "2.2", "3.3"]);
    expect(result.toString()).toBe("6.6");
  });

  test("sum of empty array = 0", () => {
    expect(BigPrecision.sum([]).toString()).toBe("0");
  });
});

describe("BigPrecision — Precision Configuration", () => {
  test("getPrecision / setPrecision", () => {
    BigPrecision.setPrecision(40);
    expect(BigPrecision.getPrecision()).toBe(40);
  });

  test("high precision pi (40 digits)", () => {
    BigPrecision.setPrecision(40);
    const pi = BigPrecision.pi().toString();
    expect(pi.startsWith("3.14159265358979323846")).toBe(true);
  });

  test("high precision sqrt(2) (30 digits)", () => {
    BigPrecision.setPrecision(30);
    const sq2 = new BigPrecision("2").sqrt();
    // sqrt(2) = 1.41421356237309504880168872420969...
    // compare first 27 significant digits to avoid last-digit rounding variance
    expect(sq2.toString().startsWith("1.41421356237309504880168872")).toBe(
      true
    );
  });

  test("precision affects division result length", () => {
    BigPrecision.setPrecision(10);
    const result = new BigPrecision("1").div("3").toString();
    // Should have ~10 significant digits
    expect(
      result.replace("0.", "").replace(".", "").length
    ).toBeLessThanOrEqual(12);
  });
});
