import {
  numwiz,
  Arithmetic,
  Comparison,
  Formatting,
  Currency,
  Statistics,
  Advanced,
  Validation,
  Financial,
  Sequences,
  NumberWords,
  Random,
  Bitwise,
  Trigonometry,
  Conversion,
  Range,
  Matrix,
} from "../index";

// ═══════════════════════════════════════════
// 🔴 FIX VERIFICATION TESTS
// ═══════════════════════════════════════════

describe("🔴 Fix #1: Bitwise (was wrong class)", () => {
  test("AND", () => expect(Bitwise.and(0b1100, 0b1010)).toBe(0b1000));
  test("OR", () => expect(Bitwise.or(0b1100, 0b1010)).toBe(0b1110));
  test("XOR", () => expect(Bitwise.xor(0b1100, 0b1010)).toBe(0b0110));
  test("NOT", () => expect(Bitwise.not(0)).toBe(-1));
  test("leftShift", () => expect(Bitwise.leftShift(1, 3)).toBe(8));
  test("rightShift", () => expect(Bitwise.rightShift(8, 3)).toBe(1));
  test("getBit", () => expect(Bitwise.getBit(0b1010, 1)).toBe(1));
  test("getBit 0", () => expect(Bitwise.getBit(0b1010, 0)).toBe(0));
  test("setBit", () => expect(Bitwise.setBit(0b1000, 0)).toBe(0b1001));
  test("clearBit", () => expect(Bitwise.clearBit(0b1010, 1)).toBe(0b1000));
  test("toggleBit", () => expect(Bitwise.toggleBit(0b1010, 0)).toBe(0b1011));
  test("countBits", () => expect(Bitwise.countBits(0b11011)).toBe(4));
  test("isPowerOfTwo true", () => expect(Bitwise.isPowerOfTwo(8)).toBe(true));
  test("isPowerOfTwo false", () => expect(Bitwise.isPowerOfTwo(6)).toBe(false));
  test("nearestPowerOfTwo", () => expect(Bitwise.nearestPowerOfTwo(5)).toBe(4));
  test("nextPowerOfTwo", () => expect(Bitwise.nextPowerOfTwo(5)).toBe(8));
  test("xorSwap", () => expect(Bitwise.xorSwap(3, 7)).toEqual([7, 3]));
  test("toBinaryString", () =>
    expect(Bitwise.toBinaryString(10, 8)).toBe("00001010"));
  test("throws on non-number", () => {
    expect(() => Bitwise.and("a" as any, 1)).toThrow(TypeError);
  });
});

describe("🔴 Fix #2: Trigonometry (was wrong class)", () => {
  test("sin(0) = 0", () => expect(Trigonometry.sin(0)).toBe(0));
  test("cos(0) = 1", () => expect(Trigonometry.cos(0)).toBe(1));
  test("tan(0) = 0", () => expect(Trigonometry.tan(0)).toBe(0));
  test("sin(π/2) ≈ 1", () =>
    expect(Trigonometry.sin(Math.PI / 2)).toBeCloseTo(1));
  test("asin(1) = π/2", () =>
    expect(Trigonometry.asin(1)).toBeCloseTo(Math.PI / 2));
  test("acos(1) = 0", () => expect(Trigonometry.acos(1)).toBeCloseTo(0));
  test("asin out of range throws", () => {
    expect(() => Trigonometry.asin(2)).toThrow(RangeError);
  });
  test("sinh(0) = 0", () => expect(Trigonometry.sinh(0)).toBe(0));
  test("cosh(0) = 1", () => expect(Trigonometry.cosh(0)).toBe(1));
  test("sec(0) = 1", () => expect(Trigonometry.sec(0)).toBe(1));
  test("toRadians(180) = π", () => {
    expect(Trigonometry.toRadians(180)).toBeCloseTo(Math.PI);
  });
  test("toDegrees(π) = 180", () => {
    expect(Trigonometry.toDegrees(Math.PI)).toBeCloseTo(180);
  });
  test("normalizeDegrees(370) = 10", () => {
    expect(Trigonometry.normalizeDegrees(370)).toBeCloseTo(10);
  });
  test("hypot(3,4) = 5", () => expect(Trigonometry.hypot(3, 4)).toBe(5));
  test("lawOfCosinesSide — equilateral", () => {
    const c = Trigonometry.lawOfCosinesSide(1, 1, Math.PI / 3);
    expect(c).toBeCloseTo(1);
  });
  test("lawOfCosinesAngle", () => {
    const angle = Trigonometry.lawOfCosinesAngle(3, 4, 5);
    expect(Trigonometry.toDegrees(angle)).toBeCloseTo(90);
  });
  test("log(1) = 0", () => expect(Trigonometry.log(1)).toBe(0));
  test("log2(8) = 3", () => expect(Trigonometry.log2(8)).toBe(3));
  test("log10(100) = 2", () => expect(Trigonometry.log10(100)).toBe(2));
  test("logN(8,2) = 3", () => expect(Trigonometry.logN(8, 2)).toBeCloseTo(3));
  test("log of negative throws", () => {
    expect(() => Trigonometry.log(-1)).toThrow(RangeError);
  });
});

describe("🔴 Fix #3: Arithmetic.subtract", () => {
  test("subtract(10, 3) = 7", () => {
    expect(Arithmetic.subtract(10, 3)).toBe(7);
  });
  test("subtract(10, 3, 2) = 5", () => {
    expect(Arithmetic.subtract(10, 3, 2)).toBe(5);
  });
  test("subtract(100, 20, 30, 10) = 40", () => {
    expect(Arithmetic.subtract(100, 20, 30, 10)).toBe(40);
  });
  test("subtract single number returns itself", () => {
    expect(Arithmetic.subtract(42)).toBe(42);
  });
  test("subtract no args returns 0", () => {
    expect(Arithmetic.subtract()).toBe(0);
  });
  test("add still works", () => {
    expect(Arithmetic.add(1, 2, 3)).toBe(6);
  });
  test("divide by zero throws", () => {
    expect(() => Arithmetic.divide(10, 0)).toThrow();
  });
  test("sqrt of negative throws", () => {
    expect(() => Arithmetic.sqrt(-4)).toThrow(RangeError);
  });
  test("non-number input throws", () => {
    expect(() => Arithmetic.add("a" as any, 1)).toThrow(TypeError);
  });
});

describe("🔴 Fix #4: Advanced.eulerTotient (was mutating n)", () => {
  test("φ(1) = 1", () => expect(Advanced.eulerTotient(1)).toBe(1));
  test("φ(10) = 4", () => expect(Advanced.eulerTotient(10)).toBe(4));
  test("φ(12) = 4", () => expect(Advanced.eulerTotient(12)).toBe(4));
  test("φ(7) = 6 (prime)", () => expect(Advanced.eulerTotient(7)).toBe(6));
  test("φ(36) = 12", () => expect(Advanced.eulerTotient(36)).toBe(12));
  test("φ(100) = 40", () => expect(Advanced.eulerTotient(100)).toBe(40));
  test("throws on 0", () => {
    expect(() => Advanced.eulerTotient(0)).toThrow(RangeError);
  });
  test("throws on negative", () => {
    expect(() => Advanced.eulerTotient(-5)).toThrow(RangeError);
  });
});

describe("🔴 Fix #5: Chain NaN propagation & safe mode", () => {
  test("invalid input throws by default", () => {
    expect(() => numwiz("hello" as any)).toThrow(TypeError);
  });

  test("divide by zero throws by default", () => {
    expect(() => numwiz(10).divide(0)).toThrow();
  });

  test("sqrt(-1) throws by default", () => {
    expect(() => numwiz(-1).sqrt()).toThrow(RangeError);
  });

  test("safe mode: invalid input → NaN", () => {
    const result = numwiz.safe(NaN).add(5).val();
    expect(result).toBeNaN();
  });

  test("safe mode: divide by zero → NaN", () => {
    const result = numwiz.safe(10).divide(0).val();
    expect(result).toBeNaN();
  });

  test("safe mode: NaN propagates through chain", () => {
    const result = numwiz.safe(10).divide(0).add(5).multiply(2).val();
    expect(result).toBeNaN();
  });

  test("safe mode: isValid() returns false for NaN", () => {
    expect(numwiz.safe(10).divide(0).isValid()).toBe(false);
  });

  test("safe mode: isValid() returns true for good chain", () => {
    expect(numwiz.safe(10).add(5).isValid()).toBe(true);
  });

  test("normal chain still works", () => {
    expect(numwiz(100).add(50).multiply(2).subtract(100).val()).toBe(200);
  });
});

// ═══════════════════════════════════════════
// 🟠 FIX VERIFICATION TESTS
// ═══════════════════════════════════════════

describe("🟠 Fix #6: conversion.hoursToDays (was hoursTodays)", () => {
  test("hoursToDays(48) = 2", () => {
    expect(Conversion.hoursToDays(48)).toBe(2);
  });
  test("deprecated hoursTodays still works", () => {
    expect(Conversion.hoursTodays(24)).toBe(1);
  });
  test("other conversions work", () => {
    expect(Conversion.celsiusToFahrenheit(0)).toBe(32);
    expect(Conversion.celsiusToFahrenheit(100)).toBe(212);
    expect(Conversion.fahrenheitToCelsius(32)).toBe(0);
    expect(Conversion.kmToMiles(1)).toBeCloseTo(0.621, 2);
    expect(Conversion.milesToKm(1)).toBeCloseTo(1.609, 2);
    expect(Conversion.kgToLbs(1)).toBeCloseTo(2.205, 2);
    expect(Conversion.celsiusToKelvin(0)).toBe(273.15);
    expect(Conversion.toBinary(10)).toBe("1010");
    expect(Conversion.toHex(255)).toBe("FF");
    expect(Conversion.toOctal(8)).toBe("10");
    expect(Conversion.degreesToRadians(180)).toBeCloseTo(Math.PI);
    expect(Conversion.bytesToKB(1024)).toBe(1);
    expect(Conversion.bytesToMB(1048576)).toBe(1);
    expect(Conversion.msToSeconds(1000)).toBe(1);
  });
});

describe("🟠 Fix #7: toPercentage consistency", () => {
  test("Formatting.toPercentage — value IS the percentage", () => {
    expect(Formatting.toPercentage(85.6)).toBe("85.60%");
  });

  test("Formatting.ratioToPercentage — value is 0-1 ratio", () => {
    expect(Formatting.ratioToPercentage(0.856)).toBe("85.60%");
  });

  test("numwiz().toPercentage — value IS the percentage", () => {
    expect(numwiz(50).toPercentage()).toBe("50.00%");
  });

  test("numwiz().ratioToPercentage — value is 0-1 ratio", () => {
    expect(numwiz(0.5).ratioToPercentage()).toBe("50.00%");
  });

  test("Formatting.fromPercentage", () => {
    expect(Formatting.fromPercentage("85.6%")).toBeCloseTo(0.856);
  });
});

describe("🟠 Fix #9: Statistics edge cases", () => {
  test("sampleVariance throws on single element", () => {
    expect(() => Statistics.sampleVariance([5])).toThrow(RangeError);
  });

  test("sampleVariance throws on empty array", () => {
    expect(() => Statistics.sampleVariance([])).toThrow(RangeError);
  });

  test("sampleVariance works with 2+ elements", () => {
    expect(Statistics.sampleVariance([2, 4])).toBe(2);
  });

  test("sampleStdDev throws on single element", () => {
    expect(() => Statistics.sampleStdDev([5])).toThrow(RangeError);
  });

  test("skewness throws on < 3 elements", () => {
    expect(() => Statistics.skewness([1, 2])).toThrow(RangeError);
  });

  test("correlation throws on mismatched lengths", () => {
    expect(() => Statistics.correlation([1, 2], [1])).toThrow();
  });

  test("correlation works", () => {
    expect(Statistics.correlation([1, 2, 3], [2, 4, 6])).toBeCloseTo(1);
  });

  test("zScore throws when stdDev is 0", () => {
    expect(() => Statistics.zScore(5, [5, 5, 5])).toThrow();
  });

  test("zScore works normally", () => {
    const data = [2, 4, 4, 4, 5, 5, 7, 9];
    const z = Statistics.zScore(4, data);
    expect(z).toBeCloseTo(-0.5, 1);
  });
});

describe("🟠 Fix #10: French number-words (100-scale spacing)", () => {
  test("French: 100 = 'cent' (not 'uncent')", () => {
    const result = Formatting.toWords(100, "fr");
    expect(result).toContain("cent");
    expect(result).not.toContain("uncent");
  });

  test("English: 100 = 'one hundred' (with space)", () => {
    expect(Formatting.toWords(100, "en")).toBe("one hundred");
  });

  test("German: 100 = 'einhundert' (no space)", () => {
    expect(Formatting.toWords(100, "de")).toBe("einhundert");
  });

  test("English: 200 = 'two hundred'", () => {
    expect(Formatting.toWords(200, "en")).toBe("two hundred");
  });

  test("German: 200 = 'zweihundert'", () => {
    expect(Formatting.toWords(200, "de")).toBe("zweihundert");
  });

  test("German: 21 = 'einundzwanzig' (not 'einsundzwanzig')", () => {
    expect(Formatting.toWords(21, "de")).toBe("einundzwanzig");
  });

  test("German: 1 (standalone) = 'eins'", () => {
    expect(Formatting.toWords(1, "de")).toBe("eins");
  });

  test("German: 1000 = 'eintausend'", () => {
    expect(Formatting.toWords(1000, "de")).toBe("eintausend");
  });
});

// ═══════════════════════════════════════════
// 🟡 FIX VERIFICATION — NEW LOCALES
// ═══════════════════════════════════════════

describe("🟡 Fix #11-12: New Locales (mr, gu, ta)", () => {
  test("Marathi: 42 = बेचाळीस", () => {
    expect(Formatting.toWords(42, "mr")).toBe("बेचाळीस");
  });

  test("Marathi: 100000 contains लाख", () => {
    expect(Formatting.toWords(100000, "mr")).toContain("लाख");
  });

  test("Marathi: ordinal 5 = 5वा", () => {
    expect(numwiz(5).locale("mr").toOrdinal()).toBe("5वा");
  });

  test("Gujarati: 25 = પચ્ચીસ", () => {
    expect(Formatting.toWords(25, "gu")).toBe("પચ્ચીસ");
  });

  test("Gujarati: 10000000 contains કરોડ", () => {
    expect(Formatting.toWords(10000000, "gu")).toContain("કરોડ");
  });

  test("Tamil: 5 = ஐந்து", () => {
    expect(Formatting.toWords(5, "ta")).toBe("ஐந்து");
  });

  test("Tamil: 100000 contains லட்சம்", () => {
    expect(Formatting.toWords(100000, "ta")).toContain("லட்சம்");
  });

  test("All 10 locales are registered", () => {
    const locales = NumberWords.getLocales();
    expect(locales).toContain("en");
    expect(locales).toContain("hi");
    expect(locales).toContain("es");
    expect(locales).toContain("fr");
    expect(locales).toContain("de");
    expect(locales).toContain("ar");
    expect(locales).toContain("bn");
    expect(locales).toContain("mr");
    expect(locales).toContain("gu");
    expect(locales).toContain("ta");
    expect(locales.length).toBe(10);
  });
});

// ═══════════════════════════════════════════
// ORIGINAL TESTS (all still pass)
// ═══════════════════════════════════════════

describe("Number to Words", () => {
  test("English: 0", () => expect(Formatting.toWords(0, "en")).toBe("zero"));
  test("English: 42", () =>
    expect(Formatting.toWords(42, "en")).toContain("forty"));
  test("English Western: million", () => {
    expect(Formatting.toWords(1000000, "en", "western")).toContain("million");
  });
  test("English Western: billion", () => {
    expect(Formatting.toWords(1500000000, "en", "western")).toContain(
      "billion"
    );
  });
  test("English Indian: lakh", () => {
    expect(Formatting.toWordsIndian(100000, "en")).toContain("lakh");
  });
  test("English Indian: crore", () => {
    expect(Formatting.toWordsIndian(10000000, "en")).toContain("crore");
  });
  test("English Indian: arab", () => {
    expect(Formatting.toWordsIndian(1000000000, "en")).toContain("arab");
  });
  test("Hindi: 42 = बयालीस", () => {
    expect(Formatting.toWords(42, "hi")).toBe("बयालीस");
  });
  test("Hindi: lakh", () => {
    expect(Formatting.toWords(100000, "hi")).toContain("लाख");
  });
  test("Hindi: crore", () => {
    expect(Formatting.toWords(10000000, "hi")).toContain("करोड़");
  });
  test("Spanish: 42", () => {
    expect(Formatting.toWords(42, "es")).toBe("cuarenta y dos");
  });
  test("Bengali: 25 = পঁচিশ", () => {
    expect(Formatting.toWords(25, "bn")).toBe("পঁচিশ");
  });
  test("Negative number", () => {
    const result = Formatting.toWords(-42, "en");
    expect(result).toContain("negative");
    expect(result).toContain("forty");
  });
  test("Decimal number", () => {
    const result = Formatting.toWords(3.14, "en");
    expect(result).toContain("three");
    expect(result).toContain("point");
  });
});

describe("Currency", () => {
  test("Western format: USD", () => {
    expect(Currency.format(1234567.89, "USD", "en-US")).toBe("$1,234,567.89");
  });
  test("Indian format: INR", () => {
    expect(Currency.formatIndian(1234567.89, "₹")).toBe("₹12,34,567.89");
  });
  test("Western abbreviation M", () => {
    expect(Currency.abbreviateWestern(1500000, "$")).toBe("$1.5M");
  });
  test("Western abbreviation B", () => {
    expect(Currency.abbreviateWestern(2500000000, "$")).toBe("$2.5B");
  });
  test("Indian abbreviation L", () => {
    expect(Currency.abbreviateIndian(1500000, "₹")).toContain("15");
    expect(Currency.abbreviateIndian(1500000, "₹")).toContain("L");
  });
  test("Indian abbreviation Cr", () => {
    expect(Currency.abbreviateIndian(25000000, "₹")).toContain("Cr");
  });
  test("Currency to words (Western)", () => {
    const result = Currency.toWords(1234.56, "USD", "en");
    expect(result).toContain("dollar");
    expect(result).toContain("cent");
  });
  test("Currency to words (Indian English)", () => {
    const result = Currency.toWordsIndian(1234567, "INR", "en");
    expect(result).toContain("lakh");
    expect(result).toContain("rupee");
  });
  test("Currency to words (Hindi)", () => {
    const result = Currency.toWordsHindi(100000);
    expect(result).toContain("लाख");
    expect(result).toContain("रुपय");
  });
  test("getSymbol", () => {
    expect(Currency.getSymbol("USD")).toBe("$");
    expect(Currency.getSymbol("INR")).toBe("₹");
    expect(Currency.getSymbol("EUR")).toBe("€");
    expect(Currency.getSymbol("GBP")).toBe("£");
  });
});

describe("Chainable NumWiz", () => {
  test("Arithmetic chain", () => {
    expect(numwiz(100).add(50).multiply(2).subtract(100).val()).toBe(200);
  });
  test("Locale: Hindi", () => {
    expect(numwiz(42).locale("hi").toWords()).toBe("बयालीस");
  });
  test("System: Indian", () => {
    expect(numwiz(10000000).locale("en").system("indian").toWords()).toContain(
      "crore"
    );
  });
  test("Currency Indian format", () => {
    expect(numwiz(2500000).toCurrencyIndian("₹")).toBe("₹25,00,000.00");
  });
  test("Abbreviate Western", () => {
    expect(numwiz(1500000).abbreviate()).toBe("1.5M");
  });
  test("Ordinal English", () => {
    expect(numwiz(1).toOrdinal()).toBe("1st");
    expect(numwiz(2).toOrdinal()).toBe("2nd");
    expect(numwiz(3).toOrdinal()).toBe("3rd");
    expect(numwiz(11).toOrdinal()).toBe("11th");
  });
  test("Ordinal Hindi", () => {
    expect(numwiz(5).locale("hi").toOrdinal()).toBe("5वाँ");
  });
  test("Roman numerals", () => {
    expect(numwiz(2024).toRoman()).toBe("MMXXIV");
  });
  test("Commas", () => {
    expect(numwiz(1234567).toCommas()).toBe("1,234,567");
  });
  test("Indian Commas", () => {
    expect(numwiz(1234567).toIndianCommas()).toBe("12,34,567");
  });
});

describe("Financial", () => {
  test("Simple Interest", () => {
    expect(Financial.simpleInterest(10000, 10, 2)).toBe(2000);
  });
  test("EMI", () => {
    const emi = Financial.emi(1000000, 8.5, 240);
    expect(emi).toBeGreaterThan(8000);
    expect(emi).toBeLessThan(9000);
  });
  test("CAGR", () => {
    expect(Financial.cagr(100000, 200000, 5)).toBeCloseTo(14.87, 1);
  });
  test("Discount", () => {
    expect(Financial.discount(1000, 20)).toBe(800);
  });
  test("ROI", () => {
    expect(Financial.roi(1500, 1000)).toBe(50);
  });
  test("Tax", () => {
    expect(Financial.taxAmount(1000, 18)).toBe(180);
  });
  test("Price with tax", () => {
    expect(Financial.priceWithTax(1000, 18)).toBe(1180);
  });
  test("Amortization schedule length", () => {
    const schedule = Financial.amortizationSchedule(100000, 10, 12);
    expect(schedule).toHaveLength(12);
    expect(schedule[0]).toHaveProperty("month", 1);
    expect(schedule[0]).toHaveProperty("emi");
    expect(schedule[0]).toHaveProperty("principal");
    expect(schedule[0]).toHaveProperty("interest");
    expect(schedule[0]).toHaveProperty("balance");
    expect(schedule[11].balance).toBe(0);
  });
});

describe("Statistics", () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];

  test("sum", () => expect(Statistics.sum(data)).toBe(40));
  test("mean", () => expect(Statistics.mean(data)).toBe(5));
  test("median", () => expect(Statistics.median(data)).toBe(4.5));
  test("mode", () => expect(Statistics.mode(data)).toEqual([4]));
  test("min", () => expect(Statistics.min(data)).toBe(2));
  test("max", () => expect(Statistics.max(data)).toBe(9));
  test("range", () => expect(Statistics.range(data)).toBe(7));
  test("stdDev", () => expect(Statistics.stdDev(data)).toBeCloseTo(2, 0));

  test("quartiles", () => {
    const q = Statistics.quartiles(data);
    expect(q.Q2).toBe(4.5);
    expect(q).toHaveProperty("Q1");
    expect(q).toHaveProperty("Q3");
  });

  test("percentile 50 = median", () => {
    expect(Statistics.percentile(data, 50)).toBe(Statistics.median(data));
  });

  test("frequency", () => {
    const f = Statistics.frequency([1, 1, 2, 3, 3, 3]);
    expect(f[1]).toBe(2);
    expect(f[3]).toBe(3);
  });

  test("geometricMean", () => {
    expect(Statistics.geometricMean([2, 8])).toBeCloseTo(4);
  });

  test("harmonicMean", () => {
    expect(Statistics.harmonicMean([1, 4, 4])).toBeCloseTo(2);
  });

  test("weightedMean", () => {
    expect(Statistics.weightedMean([80, 90], [3, 2])).toBeCloseTo(84);
  });
});

describe("Advanced", () => {
  test("factorial 0", () => expect(Advanced.factorial(0)).toBe(1));
  test("factorial 5", () => expect(Advanced.factorial(5)).toBe(120));
  test("factorial negative throws", () => {
    expect(() => Advanced.factorial(-1)).toThrow(RangeError);
  });
  test("factorial float throws", () => {
    expect(() => Advanced.factorial(3.5)).toThrow(TypeError);
  });
  test("gcd", () => expect(Advanced.gcd(12, 8)).toBe(4));
  test("lcm", () => expect(Advanced.lcm(4, 6)).toBe(12));
  test("gcdArray", () => expect(Advanced.gcdArray([12, 8, 4])).toBe(4));
  test("lcmArray", () => expect(Advanced.lcmArray([4, 6, 8])).toBe(24));
  test("fibonacci", () => expect(Advanced.fibonacci(10)).toBe(55));
  test("fibonacciSequence", () => {
    expect(Advanced.fibonacciSequence(7)).toEqual([0, 1, 1, 2, 3, 5, 8]);
  });
  test("primeFactors", () =>
    expect(Advanced.primeFactors(60)).toEqual([2, 2, 3, 5]));
  test("divisors", () =>
    expect(Advanced.divisors(12)).toEqual([1, 2, 3, 4, 6, 12]));
  test("collatz", () =>
    expect(Advanced.collatz(6)).toEqual([6, 3, 10, 5, 16, 8, 4, 2, 1]));
  test("digitalRoot", () => expect(Advanced.digitalRoot(493)).toBe(7));
  test("pascal row 4", () =>
    expect(Advanced.pascal(4)).toEqual([1, 4, 6, 4, 1]));
  test("reverseNumber", () => expect(Advanced.reverseNumber(123)).toBe(321));
  test("reverseNumber negative", () =>
    expect(Advanced.reverseNumber(-123)).toBe(-321));
  test("digitSum", () => expect(Advanced.digitSum(493)).toBe(16));
  test("countDigits", () => expect(Advanced.countDigits(12345)).toBe(5));
  test("isPalindrome", () => expect(Advanced.isPalindrome(12321)).toBe(true));
  test("lerp", () => expect(Advanced.lerp(0, 10, 0.5)).toBe(5));
  test("percentChange", () =>
    expect(Advanced.percentChange(100, 150)).toBe(50));
  test("catalan", () => expect(Advanced.catalan(4)).toBe(14));
});

describe("Validation", () => {
  test("isNumber", () => {
    expect(Validation.isNumber(42)).toBe(true);
    expect(Validation.isNumber(NaN)).toBe(false);
    expect(Validation.isNumber("42")).toBe(false);
  });
  test("isEven/isOdd", () => {
    expect(Validation.isEven(4)).toBe(true);
    expect(Validation.isOdd(3)).toBe(true);
  });
  test("isPrime", () => {
    expect(Validation.isPrime(97)).toBe(true);
    expect(Validation.isPrime(4)).toBe(false);
    expect(Validation.isPrime(1)).toBe(false);
    expect(Validation.isPrime(2)).toBe(true);
  });
  test("isArmstrong", () => {
    expect(Validation.isArmstrong(153)).toBe(true);
    expect(Validation.isArmstrong(154)).toBe(false);
  });
  test("isPalindrome", () => {
    expect(Validation.isPalindrome(12321)).toBe(true);
    expect(Validation.isPalindrome(12345)).toBe(false);
  });
  test("isPerfectNumber", () => {
    expect(Validation.isPerfectNumber(6)).toBe(true);
    expect(Validation.isPerfectNumber(28)).toBe(true);
    expect(Validation.isPerfectNumber(12)).toBe(false);
  });
  test("isHarshad", () => {
    expect(Validation.isHarshad(18)).toBe(true);
  });
  test("isPowerOfTwo", () => {
    expect(Validation.isPowerOfTwo(8)).toBe(true);
    expect(Validation.isPowerOfTwo(6)).toBe(false);
  });
  test("isPerfectSquare", () => {
    expect(Validation.isPerfectSquare(16)).toBe(true);
    expect(Validation.isPerfectSquare(15)).toBe(false);
  });
  test("isPerfectCube", () => {
    expect(Validation.isPerfectCube(27)).toBe(true);
    expect(Validation.isPerfectCube(26)).toBe(false);
  });
  test("isInRange", () => {
    expect(Validation.isInRange(5, 1, 10)).toBe(true);
    expect(Validation.isInRange(11, 1, 10)).toBe(false);
  });
  test("isAbundant", () => {
    expect(Validation.isAbundant(12)).toBe(true);
  });
  test("isDeficient", () => {
    expect(Validation.isDeficient(7)).toBe(true);
  });
});

describe("Sequences", () => {
  test("fibonacci", () =>
    expect(Sequences.fibonacci(7)).toEqual([0, 1, 1, 2, 3, 5, 8]));
  test("primes", () => expect(Sequences.primes(5)).toEqual([2, 3, 5, 7, 11]));
  test("triangular", () =>
    expect(Sequences.triangular(5)).toEqual([1, 3, 6, 10, 15]));
  test("geometric", () =>
    expect(Sequences.geometric(2, 3, 4)).toEqual([2, 6, 18, 54]));
  test("arithmetic", () =>
    expect(Sequences.arithmetic(1, 3, 5)).toEqual([1, 4, 7, 10, 13]));
  test("square", () => expect(Sequences.square(5)).toEqual([1, 4, 9, 16, 25]));
  test("cube", () => expect(Sequences.cube(4)).toEqual([1, 8, 27, 64]));
  test("lucas", () => expect(Sequences.lucas(6)).toEqual([2, 1, 3, 4, 7, 11]));
  test("custom", () => {
    expect(Sequences.custom(4, (i: number) => i * i)).toEqual([0, 1, 4, 9]);
  });
});

describe("Formatting extras", () => {
  test("toRoman", () => {
    expect(Formatting.toRoman(2024)).toBe("MMXXIV");
    expect(Formatting.toRoman(14)).toBe("XIV");
  });
  test("fromRoman", () => {
    expect(Formatting.fromRoman("MMXXIV")).toBe(2024);
    expect(Formatting.fromRoman("XIV")).toBe(14);
  });
  test("toFraction", () => {
    expect(Formatting.toFraction(0.5)).toBe("1/2");
    expect(Formatting.toFraction(0.333, 100)).toBe("1/3");
  });
  test("toScientific", () => {
    expect(Formatting.toScientific(12345, 2)).toBe("1.23e+4");
  });
  test("abbreviate", () => {
    expect(Formatting.abbreviate(1500000)).toBe("1.5M");
    expect(Formatting.abbreviate(2500000000)).toBe("2.5B");
  });
  test("abbreviateIndian", () => {
    expect(Formatting.abbreviateIndian(10000000)).toContain("Cr");
    expect(Formatting.abbreviateIndian(100000)).toContain("L");
  });
  test("addCommas", () => {
    expect(Formatting.addCommas(1234567)).toBe("1,234,567");
  });
  test("addIndianCommas", () => {
    expect(Formatting.addIndianCommas(1234567)).toBe("12,34,567");
  });
  test("bankersRound", () => {
    expect(Formatting.bankersRound(2.5)).toBe(2);
    expect(Formatting.bankersRound(3.5)).toBe(4);
  });
  test("padStart", () => {
    expect(Formatting.padStart(42, 5)).toBe("00042");
  });
});

describe("Comparison", () => {
  test("isEqual", () => expect(Comparison.isEqual(1, 1)).toBe(true));
  test("isAlmostEqual", () => {
    expect(Comparison.isAlmostEqual(0.1 + 0.2, 0.3)).toBe(true);
  });
  test("clamp", () => {
    expect(Comparison.clamp(15, 0, 10)).toBe(10);
    expect(Comparison.clamp(-5, 0, 10)).toBe(0);
    expect(Comparison.clamp(5, 0, 10)).toBe(5);
  });
  test("sign", () => expect(Comparison.sign(-42)).toBe(-1));
  test("max", () => expect(Comparison.max(1, 5, 3)).toBe(5));
  test("min", () => expect(Comparison.min(1, 5, 3)).toBe(1));
});

describe("Range", () => {
  test("create", () => expect(Range.create(1, 5)).toEqual([1, 2, 3, 4, 5]));
  test("create step", () =>
    expect(Range.create(0, 10, 3)).toEqual([0, 3, 6, 9]));
  test("includes", () => {
    expect(Range.includes(5, 1, 10)).toBe(true);
    expect(Range.includes(15, 1, 10)).toBe(false);
  });
  test("wrap", () => {
    expect(Range.wrap(370, 0, 360)).toBe(10);
    expect(Range.wrap(-10, 0, 360)).toBe(350);
  });
  test("chunk", () => {
    expect(Range.chunk(1, 10, 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [10],
    ]);
  });
});

describe("Random (smoke tests)", () => {
  test("intBetween in range", () => {
    for (let i = 0; i < 100; i++) {
      const r = Random.intBetween(1, 10);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(10);
    }
  });
  test("float in [0, 1)", () => {
    for (let i = 0; i < 100; i++) {
      const r = Random.float();
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThan(1);
    }
  });
  test("boolean returns boolean", () => {
    expect(typeof Random.boolean()).toBe("boolean");
  });
  test("pick from array", () => {
    const arr = [1, 2, 3];
    expect(arr).toContain(Random.pick(arr));
  });
  test("shuffle preserves elements", () => {
    const arr = [1, 2, 3, 4, 5];
    const shuffled = Random.shuffle(arr);
    expect(shuffled.sort()).toEqual(arr.sort());
  });
  test("generateList length", () => {
    expect(Random.generateList(5, 1, 100)).toHaveLength(5);
  });
  test("uniqueList has unique values", () => {
    const list = Random.uniqueList(5, 1, 100);
    expect(new Set(list).size).toBe(5);
  });
  test("dice in range", () => {
    for (let i = 0; i < 50; i++) {
      const r = Random.dice(6);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(6);
    }
  });
  test("uuid format", () => {
    const id = Random.uuid();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    );
  });
});

// ═══════════════════════════════════════════
// 🧮 MATRIX
// ═══════════════════════════════════════════

describe("Matrix — Creation", () => {
  test("create fills with zeros", () => {
    expect(Matrix.create(2, 3)).toEqual([
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });
  test("create with fill value", () => {
    expect(Matrix.create(2, 2, 5)).toEqual([
      [5, 5],
      [5, 5],
    ]);
  });
  test("identity 3x3", () => {
    expect(Matrix.identity(3)).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
  });
  test("diagonal", () => {
    expect(Matrix.diagonal([1, 2, 3])).toEqual([
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3],
    ]);
  });
  test("fromArray", () => {
    expect(Matrix.fromArray([1, 2, 3, 4], 2, 2)).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
  test("fromArray throws on size mismatch", () => {
    expect(() => Matrix.fromArray([1, 2, 3], 2, 2)).toThrow();
  });
  test("toArray", () => {
    expect(
      Matrix.toArray([
        [1, 2],
        [3, 4],
      ])
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
  test("invalid input throws", () => {
    expect(() => Matrix.create(-1, 2)).toThrow(RangeError);
    expect(() => Matrix.shape("not a matrix" as any)).toThrow(TypeError);
  });
});

describe("Matrix — Inspection", () => {
  const A = [
    [1, 2, 3],
    [4, 5, 6],
  ];

  test("shape", () => expect(Matrix.shape(A)).toEqual([2, 3]));
  test("rows", () => expect(Matrix.rows(A)).toBe(2));
  test("cols", () => expect(Matrix.cols(A)).toBe(3));
  test("isSquare true", () =>
    expect(
      Matrix.isSquare([
        [1, 2],
        [3, 4],
      ])
    ).toBe(true));
  test("isSquare false", () => expect(Matrix.isSquare(A)).toBe(false));
  test("isSameShape true", () => {
    expect(
      Matrix.isSameShape(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [5, 6],
          [7, 8],
        ]
      )
    ).toBe(true);
  });
  test("isSameShape false", () => {
    expect(Matrix.isSameShape([[1, 2]], [[1], [2]])).toBe(false);
  });
  test("isSymmetric", () => {
    expect(
      Matrix.isSymmetric([
        [1, 2],
        [2, 1],
      ])
    ).toBe(true);
    expect(
      Matrix.isSymmetric([
        [1, 2],
        [3, 1],
      ])
    ).toBe(false);
  });
  test("get", () => expect(Matrix.get(A, 1, 2)).toBe(6));
  test("getRow", () => expect(Matrix.getRow(A, 0)).toEqual([1, 2, 3]));
  test("getCol", () => expect(Matrix.getCol(A, 1)).toEqual([2, 5]));
  test("set (immutable)", () => {
    const B = Matrix.set(A, 0, 0, 99);
    expect(B[0][0]).toBe(99);
    expect(A[0][0]).toBe(1);
  });
  test("isEqual exact", () => {
    expect(
      Matrix.isEqual(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 2],
          [3, 4],
        ]
      )
    ).toBe(true);
  });
  test("isEqual with epsilon", () => {
    expect(Matrix.isEqual([[1.0001]], [[1]], 0.001)).toBe(true);
  });
});

describe("Matrix — Arithmetic", () => {
  const A = [
    [1, 2],
    [3, 4],
  ];
  const B = [
    [5, 6],
    [7, 8],
  ];

  test("add", () =>
    expect(Matrix.add(A, B)).toEqual([
      [6, 8],
      [10, 12],
    ]));
  test("subtract", () =>
    expect(Matrix.subtract(B, A)).toEqual([
      [4, 4],
      [4, 4],
    ]));
  test("scale", () =>
    expect(Matrix.scale(A, 3)).toEqual([
      [3, 6],
      [9, 12],
    ]));
  test("negate", () =>
    expect(Matrix.negate(A)).toEqual([
      [-1, -2],
      [-3, -4],
    ]));
  test("hadamard", () =>
    expect(Matrix.hadamard(A, B)).toEqual([
      [5, 12],
      [21, 32],
    ]));
  test("add shape mismatch throws", () => {
    expect(() => Matrix.add([[1, 2]], [[1], [2]])).toThrow();
  });
  test("map", () => {
    expect(Matrix.map(A, (v) => v * 2)).toEqual([
      [2, 4],
      [6, 8],
    ]);
  });
  test("round", () => {
    expect(Matrix.round([[1.556, 2.334]], 2)).toEqual([[1.56, 2.33]]);
  });
  test("abs", () => {
    expect(
      Matrix.abs([
        [-1, -2],
        [3, -4],
      ])
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});

describe("Matrix — Multiplication", () => {
  test("multiply 2x2", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const B = [
      [5, 6],
      [7, 8],
    ];
    expect(Matrix.multiply(A, B)).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });
  test("multiply 2x3 × 3x2", () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const B = [
      [7, 8],
      [9, 10],
      [11, 12],
    ];
    expect(Matrix.multiply(A, B)).toEqual([
      [58, 64],
      [139, 154],
    ]);
  });
  test("multiply incompatible shapes throws", () => {
    expect(() => Matrix.multiply([[1, 2]], [[1, 2]])).toThrow();
  });
  test("power A^0 = identity", () => {
    const A = [
      [2, 1],
      [5, 3],
    ];
    expect(Matrix.power(A, 0)).toEqual(Matrix.identity(2));
  });
  test("power A^1 = A", () => {
    const A = [
      [2, 1],
      [5, 3],
    ];
    expect(Matrix.power(A, 1)).toEqual(A);
  });
  test("power A^2", () => {
    const A = [
      [1, 1],
      [0, 1],
    ];
    expect(Matrix.power(A, 3)).toEqual([
      [1, 3],
      [0, 1],
    ]);
  });
});

describe("Matrix — Transformations", () => {
  test("transpose square", () => {
    expect(
      Matrix.transpose([
        [1, 2],
        [3, 4],
      ])
    ).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });
  test("transpose rectangular", () => {
    expect(
      Matrix.transpose([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });
  test("clone does not share reference", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const B = Matrix.clone(A);
    B[0][0] = 99;
    expect(A[0][0]).toBe(1);
  });
});

describe("Matrix — Reduction", () => {
  const A = [
    [1, 2],
    [3, 4],
  ];

  test("sum", () => expect(Matrix.sum(A)).toBe(10));
  test("min", () => expect(Matrix.min(A)).toBe(1));
  test("max", () => expect(Matrix.max(A)).toBe(4));
  test("mean", () => expect(Matrix.mean(A)).toBe(2.5));
  test("trace", () => expect(Matrix.trace(A)).toBe(5));
  test("norm (Frobenius)", () => {
    expect(
      Matrix.norm([
        [3, 0],
        [4, 0],
      ])
    ).toBe(5);
  });
  test("sumAxis rows", () => {
    expect(
      Matrix.sumAxis(
        [
          [1, 2, 3],
          [4, 5, 6],
        ],
        "row"
      )
    ).toEqual([6, 15]);
  });
  test("sumAxis cols", () => {
    expect(
      Matrix.sumAxis(
        [
          [1, 2],
          [3, 4],
        ],
        "col"
      )
    ).toEqual([4, 6]);
  });
  test("trace non-square throws", () => {
    expect(() =>
      Matrix.trace([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toThrow();
  });
});

describe("Matrix — Linear Algebra", () => {
  test("determinant 1x1", () => {
    expect(Matrix.determinant([[7]])).toBe(7);
  });
  test("determinant 2x2", () => {
    expect(
      Matrix.determinant([
        [1, 2],
        [3, 4],
      ])
    ).toBeCloseTo(-2);
  });
  test("determinant 3x3", () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(Matrix.determinant(A)).toBeCloseTo(0);
  });
  test("determinant 3x3 non-singular", () => {
    const A = [
      [2, -1, 0],
      [-1, 2, -1],
      [0, -1, 2],
    ];
    expect(Matrix.determinant(A)).toBeCloseTo(4);
  });
  test("inverse 2x2", () => {
    const A = [
      [4, 7],
      [2, 6],
    ];
    const inv = Matrix.inverse(A);
    const product = Matrix.round(Matrix.multiply(A, inv), 10);
    expect(product[0][0]).toBeCloseTo(1);
    expect(product[0][1]).toBeCloseTo(0);
    expect(product[1][0]).toBeCloseTo(0);
    expect(product[1][1]).toBeCloseTo(1);
  });
  test("inverse singular throws Error", () => {
    expect(() =>
      Matrix.inverse([
        [1, 2],
        [2, 4],
      ])
    ).toThrow(Error);
  });
  test("rank full rank 3x3", () => {
    const A = [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ];
    expect(Matrix.rank(A)).toBe(3);
  });
  test("rank rank-deficient", () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(Matrix.rank(A)).toBe(2);
  });
  test("solve linear system", () => {
    const A = [
      [2, 3],
      [1, -1],
    ];
    const b = [8, -1];
    const x = Matrix.solve(A, b);
    expect(x[0][0]).toBeCloseTo(1);
    expect(x[1][0]).toBeCloseTo(2);
  });
  test("solve singular throws Error", () => {
    expect(() =>
      Matrix.solve(
        [
          [1, 2],
          [2, 4],
        ],
        [1, 2]
      )
    ).toThrow(Error);
  });
  test("LU decomposition P·A = L·U", () => {
    const A = [
      [2, 1, 1],
      [4, 3, 3],
      [8, 7, 9],
    ];
    const { L, U, P } = Matrix.lu(A);
    const PA = Matrix.multiply(P, A);
    const LU = Matrix.round(Matrix.multiply(L, U), 10);
    const PAr = Matrix.round(PA, 10);
    expect(Matrix.isEqual(LU, PAr, 1e-8)).toBe(true);
  });
  test("RREF identity unchanged", () => {
    const I = Matrix.identity(3);
    expect(Matrix.round(Matrix.rref(I), 8)).toEqual(I);
  });
  test("RREF reduces correctly", () => {
    const A = [
      [1, 2, -1, -4],
      [2, 3, -1, -11],
      [-2, 0, -3, 22],
    ];
    const rref = Matrix.round(Matrix.rref(A), 8);
    expect(rref[0][0]).toBeCloseTo(1);
    expect(rref[1][1]).toBeCloseTo(1);
    expect(rref[2][2]).toBeCloseTo(1);
  });
  test("eigenvalues2x2 real", () => {
    const A = [
      [5, 1],
      [0, 3],
    ];
    const ev = Matrix.eigenvalues2x2(A);
    expect(ev).toContain(5);
    expect(ev).toContain(3);
  });
  test("eigenvalues2x2 complex", () => {
    const A = [
      [0, -1],
      [1, 0],
    ];
    const ev = Matrix.eigenvalues2x2(A);
    expect(ev[0]).toHaveProperty("real");
    expect(ev[0]).toHaveProperty("imag");
  });
});

describe("Matrix — Structure", () => {
  test("hStack", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const B = [[5], [6]];
    expect(Matrix.hStack(A, B)).toEqual([
      [1, 2, 5],
      [3, 4, 6],
    ]);
  });
  test("vStack", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const B = [[5, 6]];
    expect(Matrix.vStack(A, B)).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });
  test("slice", () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(Matrix.slice(A, 0, 1, 2, 3)).toEqual([
      [2, 3],
      [5, 6],
    ]);
  });
  test("swapRows", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    expect(Matrix.swapRows(A, 0, 1)).toEqual([
      [3, 4],
      [1, 2],
    ]);
  });
  test("swapCols", () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    expect(Matrix.swapCols(A, 0, 2)).toEqual([
      [3, 2, 1],
      [6, 5, 4],
    ]);
  });
  test("hStack row mismatch throws", () => {
    expect(() => Matrix.hStack([[1, 2]], [[1], [2]])).toThrow();
  });
});

describe("Matrix — Display", () => {
  test("toString returns string", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const s = Matrix.toString(A, 0);
    expect(typeof s).toBe("string");
    expect(s).toContain("1");
    expect(s).toContain("4");
  });
});
