# NumWiz

> The ultimate number utility library for JavaScript & TypeScript — arithmetic, formatting, currency, number-to-words in 10 languages, statistics, financial math, matrix algebra, scientific computing (NDArray, LinAlg, FFT, Calculus, Polynomial, Interpolation, Signal), and arbitrary-precision decimals.

[![npm version](https://img.shields.io/npm/v/numwiz.svg)](https://www.npmjs.com/package/numwiz)
[![npm downloads](https://img.shields.io/npm/dm/numwiz.svg)](https://www.npmjs.com/package/numwiz)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](../LICENSE)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/numwiz)](https://bundlephobia.com/package/numwiz)
[![Build Status](https://img.shields.io/github/actions/workflow/status/isubroto/numwiz/publish.yml?branch=main)](https://github.com/isubroto/numwiz/actions)

---

## Table of Contents

1. [Installation](#installation)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Chainable API — `numwiz()`](#chainable-api--numwiz)
   - [Arithmetic Methods](#arithmetic-methods)
   - [Configuration](#configuration)
   - [Output Methods](#output-methods)
   - [Safe Mode](#safe-mode)
5. [Static Modules](#static-modules)
   - [Arithmetic](#arithmetic)
   - [Formatting](#formatting)
   - [Validation](#validation)
   - [Comparison](#comparison)
   - [Conversion](#conversion)
   - [Bitwise](#bitwise)
   - [Trigonometry](#trigonometry)
   - [Statistics](#statistics)
   - [Financial](#financial)
   - [Advanced](#advanced)
   - [Sequences](#sequences)
   - [Random](#random)
   - [Range](#range)
   - [Currency](#currency)
   - [NumberWords](#numberwords)
   - [Matrix](#matrix)
   - [NDArray](#ndarray)
   - [LinAlg](#linalg)
   - [Polynomial](#polynomial)
   - [Calculus](#calculus)
   - [FFT](#fft)
   - [Interpolation](#interpolation)
   - [Signal](#signal)
   - [BigPrecision](#bigprecision)
6. [Subpath Imports](#subpath-imports)
7. [Supported Locales](#supported-locales)
8. [TypeScript Support](#typescript-support)
9. [Error Reference](#error-reference)

---

## Installation

```bash
npm install numwiz
```

---

## Quick Start

```ts
import numwiz, { Arithmetic, Formatting, Statistics, Matrix } from "numwiz";

// Chainable API
numwiz(1234567).toCommas(); // "1,234,567"
numwiz(1000000).locale("hi").toWords(); // "दस लाख"
numwiz(50).add(50).multiply(2).abbreviate(); // "200"

// Static modules
Arithmetic.add(1, 2, 3, 4); // 10
Formatting.toWords(1000000, "en", "indian"); // "ten lakh"
Statistics.mean([1, 2, 3, 4, 5]); // 3
Matrix.determinant([
  [1, 2],
  [3, 4],
]); // -2

// Scientific computing — NDArray (numpy-style)
import { NDArray } from "numwiz";
const a = NDArray.arange(0, 6).reshape([2, 3]);
a.shape; // [2, 3]
NDArray.linspace(0, 1, 5).toArray(); // [0, 0.25, 0.5, 0.75, 1]
const m = NDArray.from([
  [1, 2],
  [3, 4],
]);
m.dot(m).toArray(); // [[7,10],[15,22]]

// Scientific computing — Linear Algebra
import { LinAlg } from "numwiz";
LinAlg.det([
  [1, 2],
  [3, 4],
]); // -2
LinAlg.inv([
  [1, 2],
  [3, 4],
]); // [[-2, 1], [1.5, -0.5]]
const { values, vectors } = LinAlg.eig([
  [2, 1],
  [1, 2],
]);

// Scientific computing — FFT
import { FFT } from "numwiz";
const spectrum = FFT.fft([1, 0, -1, 0]);
FFT.powerSpectrum([1, 2, 3, 4]).toArray();

// Scientific computing — Calculus
import { Calculus } from "numwiz";
Calculus.derivative((x) => x ** 3, 2); // ≈12
Calculus.integrate((x) => x ** 2, 0, 3); // ≈9 (Simpson)

// Arbitrary precision decimals
import { BigPrecision } from "numwiz";
new BigPrecision("0.1").add("0.2").toString(); // "0.3" (exact)
BigPrecision.setPrecision(50);
BigPrecision.pi().toString(); // 50-digit π
```

---

## Architecture

NumWiz exposes two parallel patterns:

| Pattern                   | How to use                       | Best for                                     |
| ------------------------- | -------------------------------- | -------------------------------------------- |
| **Chainable** `numwiz(n)` | `numwiz(100).add(50).toCommas()` | Fluent transformations on a single number    |
| **Static modules**        | `Arithmetic.add(1, 2, 3)`        | Direct one-off calls, tree-shakeable imports |

All static methods are **pure** and **non-mutating** — inputs are never modified.

---

## Chainable API — `numwiz()`

### Import

```ts
import numwiz from "numwiz";
// CommonJS
const { numwiz } = require("numwiz");
```

### Basic Example

```ts
const result = numwiz(9876543).add(123457).multiply(2).abbreviate(); // "20M"

numwiz(1500000).locale("hi").system("indian").toWords(); // "पंद्रह लाख"

numwiz(99.5).round(0).toCurrency("USD"); // "$100.00"
```

---

### Arithmetic Methods

All arithmetic methods update the internal value in-chain and return `this`.

| Method              | Description             | Example                                   |
| ------------------- | ----------------------- | ----------------------------------------- |
| `.add(n)`           | Add `n`                 | `numwiz(10).add(5).val()` → `15`          |
| `.subtract(n)`      | Subtract `n`            | `numwiz(10).subtract(3).val()` → `7`      |
| `.multiply(n)`      | Multiply by `n`         | `numwiz(4).multiply(3).val()` → `12`      |
| `.divide(n)`        | Divide by `n`           | `numwiz(10).divide(2).val()` → `5`        |
| `.mod(n)`           | Modulo `n`              | `numwiz(10).mod(3).val()` → `1`           |
| `.power(n)`         | Raise to power `n`      | `numwiz(2).power(8).val()` → `256`        |
| `.sqrt()`           | Square root             | `numwiz(9).sqrt().val()` → `3`            |
| `.cbrt()`           | Cube root               | `numwiz(27).cbrt().val()` → `3`           |
| `.abs()`            | Absolute value          | `numwiz(-5).abs().val()` → `5`            |
| `.negate()`         | Negate                  | `numwiz(5).negate().val()` → `-5`         |
| `.floor()`          | Floor                   | `numwiz(4.9).floor().val()` → `4`         |
| `.ceil()`           | Ceiling                 | `numwiz(4.1).ceil().val()` → `5`          |
| `.trunc()`          | Truncate toward zero    | `numwiz(4.9).trunc().val()` → `4`         |
| `.round(decimals?)` | Round to decimal places | `numwiz(3.14159).round(2).val()` → `3.14` |
| `.clamp(min, max)`  | Clamp to range          | `numwiz(150).clamp(0, 100).val()` → `100` |
| `.percent(p)`       | `p`% of value           | `numwiz(200).percent(15).val()` → `30`    |

---

### Configuration

These chainable setters affect how output methods behave. Each returns `this`.

| Method                         | Description                           | Example                             |
| ------------------------------ | ------------------------------------- | ----------------------------------- |
| `.locale(code)`                | Set locale for words/ordinals         | `.locale("hi")`, `.locale("fr")`    |
| `.system("western"\|"indian")` | Number scale for words                | `.system("indian")` uses lakh/crore |
| `.currency(code)`              | Default currency code                 | `.currency("INR")`                  |
| `.safe()`                      | Enable safe mode on an existing chain | See [Safe Mode](#safe-mode)         |

---

### Output Methods

These are **terminal** — they return a plain value (not `this`).

#### Raw value

| Method        | Returns   | Description                             |
| ------------- | --------- | --------------------------------------- |
| `.val()`      | `number`  | Current numeric value                   |
| `.result()`   | `number`  | Alias for `val()`                       |
| `.valueOf()`  | `number`  | Native coercion hook                    |
| `.toString()` | `string`  | String representation                   |
| `.isValid()`  | `boolean` | `false` if value is `NaN` or non-finite |

#### Formatting

| Method                   | Returns  | Example                                            |
| ------------------------ | -------- | -------------------------------------------------- |
| `.toFixed(d?)`           | `number` | `numwiz(3.14159).toFixed(2)` → `3.14`              |
| `.toCommas()`            | `string` | `numwiz(1234567).toCommas()` → `"1,234,567"`       |
| `.toIndianCommas()`      | `string` | `numwiz(1234567).toIndianCommas()` → `"12,34,567"` |
| `.toRoman()`             | `string` | `numwiz(2026).toRoman()` → `"MMXXVI"`              |
| `.toFraction(maxDenom?)` | `string` | `numwiz(0.333).toFraction()` → `"1/3"`             |
| `.toScientific(d?)`      | `string` | `numwiz(12345).toScientific(2)` → `"1.23e+4"`      |
| `.toEngineering()`       | `string` | `numwiz(12345).toEngineering()` → `"12.345×10^3"`  |
| `.toPercentage(d?)`      | `string` | `numwiz(75).toPercentage()` → `"75.00%"`           |
| `.ratioToPercentage(d?)` | `string` | `numwiz(0.75).ratioToPercentage()` → `"75.00%"`    |
| `.toOrdinal()`           | `string` | `numwiz(3).locale("en").toOrdinal()` → `"3rd"`     |
| `.abbreviate(d?)`        | `string` | `numwiz(1500000).abbreviate()` → `"1.5M"`          |
| `.abbreviateIndian(d?)`  | `string` | `numwiz(1500000).abbreviateIndian()` → `"15L"`     |

#### Words

| Method              | Returns  | Notes                                             |
| ------------------- | -------- | ------------------------------------------------- |
| `.toWords()`        | `string` | Uses current `.locale()` and `.system()` settings |
| `.toWordsWestern()` | `string` | Forces western scale (million/billion)            |
| `.toWordsIndian()`  | `string` | Forces Indian scale (lakh/crore)                  |

```ts
numwiz(1000000).locale("en").toWords(); // "one million"
numwiz(1000000).locale("en").toWordsIndian(); // "ten lakh"
numwiz(1000000).locale("hi").toWordsIndian(); // "दस लाख"
```

#### Currency

| Method                        | Returns  | Example                                                              |
| ----------------------------- | -------- | -------------------------------------------------------------------- |
| `.toCurrency(curr?, loc?)`    | `string` | `numwiz(1999.5).toCurrency("USD")` → `"$1,999.50"`                   |
| `.toCurrencyIndian(sym?)`     | `string` | `numwiz(1500000).toCurrencyIndian("₹")` → `"₹15,00,000.00"`          |
| `.toCurrencyWords()`          | `string` | `numwiz(150).toCurrencyWords()` → `"one hundred fifty dollars"`      |
| `.toCurrencyWordsIndian()`    | `string` | Indian English currency words                                        |
| `.toCurrencyAbbr(sym?)`       | `string` | `numwiz(1500000).currency("INR").toCurrencyAbbr()` → `"₹1.5M"`       |
| `.toCurrencyAbbrIndian(sym?)` | `string` | `numwiz(1500000).currency("INR").toCurrencyAbbrIndian()` → `"₹15 L"` |

#### Conversion

| Method        | Returns  | Example                            |
| ------------- | -------- | ---------------------------------- |
| `.toBinary()` | `string` | `numwiz(10).toBinary()` → `"1010"` |
| `.toOctal()`  | `string` | `numwiz(8).toOctal()` → `"10"`     |
| `.toHex()`    | `string` | `numwiz(255).toHex()` → `"ff"`     |
| `.toBase(b)`  | `string` | `numwiz(255).toBase(16)` → `"ff"`  |

#### Validation (boolean output)

| Method               | Returns   | Example                                    |
| -------------------- | --------- | ------------------------------------------ |
| `.isEven()`          | `boolean` | `numwiz(4).isEven()` → `true`              |
| `.isOdd()`           | `boolean` | `numwiz(3).isOdd()` → `true`               |
| `.isPrime()`         | `boolean` | `numwiz(7).isPrime()` → `true`             |
| `.isPositive()`      | `boolean` | `numwiz(1).isPositive()` → `true`          |
| `.isNegative()`      | `boolean` | `numwiz(-1).isNegative()` → `true`         |
| `.isInteger()`       | `boolean` | `numwiz(3.0).isInteger()` → `true`         |
| `.isPalindrome()`    | `boolean` | `numwiz(121).isPalindrome()` → `true`      |
| `.isArmstrong()`     | `boolean` | `numwiz(153).isArmstrong()` → `true`       |
| `.isPerfectNumber()` | `boolean` | `numwiz(6).isPerfectNumber()` → `true`     |
| `.isPowerOfTwo()`    | `boolean` | `numwiz(64).isPowerOfTwo()` → `true`       |
| `.isFiniteNum()`     | `boolean` | `numwiz(Infinity).isFiniteNum()` → `false` |

---

### Safe Mode

In safe mode, operations that would throw instead set the value to `NaN`, allowing the chain to continue.

```ts
// Default (throws)
numwiz(10).divide(0); // throws Error: Division by zero

// Safe mode via factory
numwiz.safe(10).divide(0).val(); // NaN
numwiz.safe(-9).sqrt().val(); // NaN
numwiz
  .safe("hello" as any)
  .add(1)
  .val(); // NaN

// Check validity
const n = numwiz.safe(10).divide(0);
n.isValid(); // false
n.val(); // NaN

// Enable mid-chain
numwiz(100).safe().divide(0).val(); // NaN

// Constructor form
new NumWiz(100, { safe: true });
```

---

## Static Modules

All modules are exported by name from the main package:

```ts
import { Arithmetic, Formatting, Statistics, Financial, Matrix } from "numwiz";
```

Or individually via subpath imports (tree-shakeable — see [Subpath Imports](#subpath-imports)).

---

### Arithmetic

```ts
import { Arithmetic } from "numwiz";
```

| Method        | Signature             | Description              | Example                              |
| ------------- | --------------------- | ------------------------ | ------------------------------------ |
| `add`         | `(...nums: number[])` | Sum of all arguments     | `Arithmetic.add(1,2,3)` → `6`        |
| `subtract`    | `(...nums: number[])` | Subtract from first      | `Arithmetic.subtract(10,3,2)` → `5`  |
| `multiply`    | `(...nums: number[])` | Product                  | `Arithmetic.multiply(2,3,4)` → `24`  |
| `divide`      | `(a, b)`              | Division (throws on b=0) | `Arithmetic.divide(10,4)` → `2.5`    |
| `modulus`     | `(a, b)`              | Remainder                | `Arithmetic.modulus(10,3)` → `1`     |
| `floorDivide` | `(a, b)`              | Integer division         | `Arithmetic.floorDivide(10,3)` → `3` |
| `power`       | `(base, exp)`         | Exponentiation           | `Arithmetic.power(2,10)` → `1024`    |
| `sqrt`        | `(n)`                 | Square root              | `Arithmetic.sqrt(16)` → `4`          |
| `cbrt`        | `(n)`                 | Cube root                | `Arithmetic.cbrt(27)` → `3`          |
| `nthRoot`     | `(n, root)`           | nth root                 | `Arithmetic.nthRoot(32,5)` → `2`     |
| `abs`         | `(n)`                 | Absolute value           | `Arithmetic.abs(-7)` → `7`           |
| `negate`      | `(n)`                 | Negation                 | `Arithmetic.negate(5)` → `-5`        |
| `reciprocal`  | `(n)`                 | `1/n` (throws on n=0)    | `Arithmetic.reciprocal(4)` → `0.25`  |
| `log`         | `(n)`                 | Natural log (n > 0)      | `Arithmetic.log(Math.E)` → `1`       |
| `log2`        | `(n)`                 | Log base 2               | `Arithmetic.log2(8)` → `3`           |
| `log10`       | `(n)`                 | Log base 10              | `Arithmetic.log10(100)` → `2`        |
| `exp`         | `(n)`                 | e^n                      | `Arithmetic.exp(1)` → `≈2.718`       |

---

### Formatting

```ts
import { Formatting } from "numwiz";
```

#### Rounding

| Method         | Signature       | Description          | Example                                        |
| -------------- | --------------- | -------------------- | ---------------------------------------------- |
| `toFixed`      | `(num, d?)`     | Fixed decimal places | `Formatting.toFixed(3.14159, 2)` → `3.14`      |
| `toPrecision`  | `(num, digits)` | Significant figures  | `Formatting.toPrecision(3.14159, 4)` → `3.142` |
| `round`        | `(num)`         | Standard round       | `Formatting.round(4.6)` → `5`                  |
| `floor`        | `(num)`         | Floor                | `Formatting.floor(4.9)` → `4`                  |
| `ceil`         | `(num)`         | Ceiling              | `Formatting.ceil(4.1)` → `5`                   |
| `trunc`        | `(num)`         | Truncate             | `Formatting.trunc(-4.9)` → `-4`                |
| `bankersRound` | `(num, d?)`     | Round half to even   | `Formatting.bankersRound(0.5)` → `0`           |

#### Commas

```ts
Formatting.addCommas(1234567.89); // "1,234,567.89"
Formatting.addIndianCommas(1234567.89); // "12,34,567.89"
```

#### Percentage

```ts
Formatting.toPercentage(75); // "75.00%"       value IS the percentage
Formatting.ratioToPercentage(0.75); // "75.00%"       value is a 0-1 ratio
Formatting.fromPercentage("75%"); // 0.75           string → ratio
Formatting.fromPercentageRaw("75%"); // 75             string → number
```

#### Number to Words

```ts
Formatting.toWords(1000000); // "one million"
Formatting.toWords(1000000, "en", "indian"); // "ten lakh"
Formatting.toWords(1000000, "hi", "indian"); // "दस लाख"
Formatting.toWordsIndian(1500000, "en"); // "fifteen lakh"
Formatting.toWordsWestern(1500000, "en"); // "one million five hundred thousand"
```

#### Pad

```ts
Formatting.padStart(5, 4); // "0005"
Formatting.padStart(5, 4, "*"); // "***5"
Formatting.padEnd(5, 4); // "5000"
```

#### Ordinals

```ts
Formatting.toOrdinal(1); // "1st"
Formatting.toOrdinal(2); // "2nd"
Formatting.toOrdinal(3); // "3rd"
Formatting.toOrdinal(11); // "11th"
Formatting.toOrdinal(3, "hi"); // "3वाँ"
```

#### Abbreviation

```ts
Formatting.abbreviate(1234); // "1.2K"
Formatting.abbreviate(1500000); // "1.5M"
Formatting.abbreviate(2000000000); // "2B"
Formatting.abbreviate(1500000, 2); // "1.50M"    (2 decimal places)

Formatting.abbreviateIndian(1500000); // "15L"
Formatting.abbreviateIndian(10000000); // "1Cr"
Formatting.abbreviateIndian(1000000000); // "1Arab"
```

| Scale (Western) | Suffix | Value |
| --------------- | ------ | ----- |
| Thousand        | K      | 10³   |
| Million         | M      | 10⁶   |
| Billion         | B      | 10⁹   |
| Trillion        | T      | 10¹²  |
| Quadrillion     | Qa     | 10¹⁵  |

| Scale (Indian) | Suffix | Value |
| -------------- | ------ | ----- |
| Thousand       | K      | 10³   |
| Lakh           | L      | 10⁵   |
| Crore          | Cr     | 10⁷   |
| Arab           | Arab   | 10⁹   |
| Kharab         | Kh     | 10¹¹  |

#### Notation

```ts
Formatting.toScientific(12345); // "1.2345e+4"
Formatting.toScientific(12345, 2); // "1.23e+4"
Formatting.toEngineering(12345); // "12.345×10^3"
```

#### Other

```ts
Formatting.toRoman(2026); // "MMXXVI"   (1–3999)
Formatting.fromRoman("MMXXVI"); // 2026
Formatting.toFraction(0.333); // "1/3"
Formatting.toFraction(0.625, 16); // "5/8"     (maxDenominator)
```

---

### Validation

```ts
import { Validation } from "numwiz";
```

| Method            | Signature       | Description                      | Example                                   |
| ----------------- | --------------- | -------------------------------- | ----------------------------------------- |
| `isNumber`        | `(v)`           | Type guard: finite number        | `Validation.isNumber("5")` → `false`      |
| `isInteger`       | `(v)`           | Integer check                    | `Validation.isInteger(3.0)` → `true`      |
| `isFloat`         | `(v)`           | Has decimal part                 | `Validation.isFloat(3.5)` → `true`        |
| `isFinite`        | `(v)`           | Not ±Infinity or NaN             | `Validation.isFinite(Infinity)` → `false` |
| `isNaN`           | `(v)`           | Is NaN                           | `Validation.isNaN(NaN)` → `true`          |
| `isPositive`      | `(v)`           | `> 0`                            | `Validation.isPositive(1)` → `true`       |
| `isNegative`      | `(v)`           | `< 0`                            | `Validation.isNegative(-1)` → `true`      |
| `isZero`          | `(v)`           | `=== 0`                          | `Validation.isZero(0)` → `true`           |
| `isEven`          | `(n)`           | Even integer                     | `Validation.isEven(4)` → `true`           |
| `isOdd`           | `(n)`           | Odd integer                      | `Validation.isOdd(3)` → `true`            |
| `isSafeInteger`   | `(v)`           | Within `Number.MAX_SAFE_INTEGER` |                                           |
| `isWholeNumber`   | `(v)`           | Integer ≥ 0                      |                                           |
| `isDivisibleBy`   | `(n, d)`        | `n % d === 0`                    | `Validation.isDivisibleBy(10,5)` → `true` |
| `isInRange`       | `(n, min, max)` | `min ≤ n ≤ max`                  | `Validation.isInRange(5,1,10)` → `true`   |
| `isPrime`         | `(n)`           | Prime number                     | `Validation.isPrime(17)` → `true`         |
| `isPerfectSquare` | `(n)`           | Perfect square                   | `Validation.isPerfectSquare(16)` → `true` |
| `isPerfectCube`   | `(n)`           | Perfect cube                     | `Validation.isPerfectCube(27)` → `true`   |
| `isPowerOfTwo`    | `(n)`           | Power of 2                       | `Validation.isPowerOfTwo(64)` → `true`    |
| `isPowerOfN`      | `(num, n)`      | Power of `n`                     | `Validation.isPowerOfN(27,3)` → `true`    |
| `isPalindrome`    | `(n)`           | Digit palindrome                 | `Validation.isPalindrome(121)` → `true`   |
| `isArmstrong`     | `(n)`           | Armstrong number                 | `Validation.isArmstrong(153)` → `true`    |
| `isPerfectNumber` | `(n)`           | Sum of proper divisors = n       | `Validation.isPerfectNumber(6)` → `true`  |
| `isAbundant`      | `(n)`           | Sum of proper divisors > n       | `Validation.isAbundant(12)` → `true`      |
| `isDeficient`     | `(n)`           | Sum of proper divisors < n       | `Validation.isDeficient(9)` → `true`      |
| `isHarshad`       | `(n)`           | Divisible by digit sum           | `Validation.isHarshad(18)` → `true`       |

---

### Comparison

```ts
import { Comparison } from "numwiz";

Comparison.isEqual(0.1 + 0.2, 0.3); // false (strict ===)
Comparison.isAlmostEqual(0.1 + 0.2, 0.3); // true  (ε = 1e-10)
Comparison.isAlmostEqual(0.1 + 0.2, 0.3, 1e-15); // false (custom ε)
Comparison.isGreaterThan(5, 3); // true
Comparison.isLessThan(3, 5); // true
Comparison.isGreaterThanOrEqual(5, 5); // true
Comparison.isLessThanOrEqual(4, 5); // true
Comparison.clamp(150, 0, 100); // 100
Comparison.sign(-5); // -1
Comparison.sign(0); // 0
Comparison.sign(5); // 1
Comparison.max(1, 5, 3, 9, 2); // 9
Comparison.min(1, 5, 3, 9, 2); // 1
```

---

### Conversion

```ts
import { Conversion } from "numwiz";
```

#### Type conversion

```ts
Conversion.toInteger("42.9"); // 42
Conversion.toFloat("3.14"); // 3.14
Conversion.toNumber("100"); // 100  (throws if not parseable)
Conversion.toString(255); // "255"
```

#### Base conversion

```ts
Conversion.toBinary(10); // "1010"
Conversion.toOctal(8); // "10"
Conversion.toHex(255); // "FF"
Conversion.toBase(255, 16); // "ff"
Conversion.fromBase("ff", 16); // 255
```

#### Angle

```ts
Conversion.degreesToRadians(180); // Math.PI
Conversion.radiansToDegrees(Math.PI); // 180
```

#### Temperature

```ts
Conversion.celsiusToFahrenheit(0); // 32
Conversion.fahrenheitToCelsius(32); // 0
Conversion.celsiusToKelvin(0); // 273.15
Conversion.kelvinToCelsius(273.15); // 0
Conversion.fahrenheitToKelvin(32); // 273.15
Conversion.kelvinToFahrenheit(273.15); // 32
```

#### Length & Weight

```ts
Conversion.kmToMiles(1); // 0.621371
Conversion.milesToKm(1); // 1.60934
Conversion.cmToInches(2.54); // 1
Conversion.inchesToCm(1); // 2.54
Conversion.metersToFeet(1); // 3.28084
Conversion.feetToMeters(1); // 0.3048

Conversion.kgToLbs(1); // 2.20462
Conversion.lbsToKg(1); // 0.453592
Conversion.gramsToOunces(28.35); // ≈1
Conversion.ouncesToGrams(1); // 28.3495
```

#### Data

```ts
Conversion.bytesToKB(1024); // 1
Conversion.bytesToMB(1048576); // 1
Conversion.bytesToGB(1073741824); // 1
```

#### Time

```ts
Conversion.secondsToMinutes(120); // 2
Conversion.minutesToHours(120); // 2
Conversion.hoursToDays(48); // 2
Conversion.daysToYears(365.25); // 1
Conversion.msToSeconds(3000); // 3
```

---

### Bitwise

```ts
import { Bitwise } from "numwiz";
```

All methods validate that inputs are finite numbers and throw `TypeError` otherwise.

| Method               | Signature      | Description                | Example                                        |
| -------------------- | -------------- | -------------------------- | ---------------------------------------------- |
| `and`                | `(a, b)`       | Bitwise AND                | `Bitwise.and(5, 3)` → `1`                      |
| `or`                 | `(a, b)`       | Bitwise OR                 | `Bitwise.or(5, 3)` → `7`                       |
| `xor`                | `(a, b)`       | Bitwise XOR                | `Bitwise.xor(5, 3)` → `6`                      |
| `not`                | `(a)`          | Bitwise NOT                | `Bitwise.not(5)` → `-6`                        |
| `leftShift`          | `(a, bits)`    | Left shift `<<`            | `Bitwise.leftShift(1, 4)` → `16`               |
| `rightShift`         | `(a, bits)`    | Signed right shift `>>`    | `Bitwise.rightShift(16, 2)` → `4`              |
| `unsignedRightShift` | `(a, bits)`    | Unsigned right shift `>>>` | `Bitwise.unsignedRightShift(-1, 0)`            |
| `getBit`             | `(num, pos)`   | Get bit at position        | `Bitwise.getBit(5, 0)` → `1`                   |
| `setBit`             | `(num, pos)`   | Set bit at position        | `Bitwise.setBit(5, 1)` → `7`                   |
| `clearBit`           | `(num, pos)`   | Clear bit at position      | `Bitwise.clearBit(7, 1)` → `5`                 |
| `toggleBit`          | `(num, pos)`   | Toggle bit                 | `Bitwise.toggleBit(5, 1)` → `7`                |
| `isBitSet`           | `(num, pos)`   | Check if bit is set        | `Bitwise.isBitSet(5, 0)` → `true`              |
| `countBits`          | `(num)`        | Count set bits (popcount)  | `Bitwise.countBits(7)` → `3`                   |
| `isPowerOfTwo`       | `(n)`          | `n > 0 && (n & n-1) === 0` | `Bitwise.isPowerOfTwo(64)` → `true`            |
| `nearestPowerOfTwo`  | `(n)`          | Closest power of 2         | `Bitwise.nearestPowerOfTwo(5)` → `4`           |
| `nextPowerOfTwo`     | `(n)`          | Next higher power of 2     | `Bitwise.nextPowerOfTwo(5)` → `8`              |
| `xorSwap`            | `(a, b)`       | Swap via XOR               | `Bitwise.xorSwap(3, 7)` → `[7, 3]`             |
| `toBinaryString`     | `(num, bits?)` | Zero-padded binary string  | `Bitwise.toBinaryString(10, 8)` → `"00001010"` |

---

### Trigonometry

```ts
import { Trigonometry } from "numwiz";
```

All angle arguments are in **radians** unless explicitly noted.

#### Basic

```ts
Trigonometry.sin(Math.PI / 2); // 1
Trigonometry.cos(0); // 1
Trigonometry.tan(Math.PI / 4); // ≈1
```

#### Inverse (throws `RangeError` for out-of-domain inputs)

```ts
Trigonometry.asin(1); // Math.PI/2   (input must be [-1, 1])
Trigonometry.acos(1); // 0           (input must be [-1, 1])
Trigonometry.atan(1); // Math.PI/4
Trigonometry.atan2(1, 1); // Math.PI/4
```

#### Hyperbolic

```ts
Trigonometry.sinh(0); // 0
Trigonometry.cosh(0); // 1
Trigonometry.tanh(0); // 0
Trigonometry.asinh(0); // 0
Trigonometry.acosh(1); // 0   (input must be ≥ 1)
Trigonometry.atanh(0); // 0   (input must be in (-1, 1))
```

#### Reciprocal

```ts
Trigonometry.sec(0); // 1   (1/cos, throws if cos=0)
Trigonometry.csc(Math.PI / 2); // 1   (1/sin, throws if sin=0)
Trigonometry.cot(Math.PI / 4); // ≈1  (1/tan, throws if tan=0)
```

#### Angle Conversion

```ts
Trigonometry.toRadians(180); // Math.PI
Trigonometry.toDegrees(Math.PI); // 180
Trigonometry.normalizeDegrees(370); // 10   (wraps to [0, 360))
Trigonometry.normalizeRadians(7); // ≈0.72 (wraps to [0, 2π))
```

#### Mathematical Constants

All constants are `static readonly` properties:

| Constant | Value                     | Python equivalent |
| -------- | ------------------------- | ----------------- |
| `PI`     | `3.141592653589793`       | `math.pi`         |
| `E`      | `2.718281828459045`       | `math.e`          |
| `TAU`    | `6.283185307179586` (2·π) | `math.tau`        |
| `PHI`    | `1.618033988749895` (φ)   | —                 |
| `SQRT2`  | `1.4142135623730951`      | `math.sqrt(2)`    |
| `LN2`    | `0.6931471805599453`      | `math.log(2)`     |
| `LN10`   | `2.302585092994046`       | `math.log(10)`    |
| `LOG2E`  | `1.4426950408889634`      | `math.log2(e)`    |
| `LOG10E` | `0.4342944819032518`      | `math.log10(e)`   |

```ts
Trigonometry.PI; // 3.141592653589793
Trigonometry.E; // 2.718281828459045
Trigonometry.TAU; // 6.283185307179586
Trigonometry.PHI; // 1.618033988749895  (golden ratio)
Trigonometry.SQRT2; // 1.4142135623730951

// Use in calculations
2 * Trigonometry.PI === Trigonometry.TAU; // true
Trigonometry.PHI ** 2 === Trigonometry.PHI + 1; // true (approximately)
```

#### Triangle Helpers

```ts
Trigonometry.hypot(3, 4); // 5
Trigonometry.hypot(1, 1, 1); // √3
Trigonometry.lawOfCosinesSide(3, 4, Math.PI / 3); // side opposite angle C
Trigonometry.lawOfCosinesAngle(3, 4, 5); // angle (radians) opposite side c=5
Trigonometry.lawOfSinesSide(3, Math.PI / 6, Math.PI / 4); // third side
Trigonometry.lawOfSinesAngle(3, 4, Math.PI / 6); // angle B
Trigonometry.triangleArea(3, 4, Math.PI / 6); // 3
```

#### Logarithms (all throw `RangeError` for invalid inputs)

```ts
Trigonometry.log(Math.E); // 1     (natural log, n > 0)
Trigonometry.log2(8); // 3
Trigonometry.log10(100); // 2
Trigonometry.logN(8, 2); // 3     (log base n)
Trigonometry.exp(1); // ≈2.718
Trigonometry.log1p(0); // 0     (ln(1 + n))
Trigonometry.expm1(0); // 0     (e^n - 1)
```

---

### Statistics

```ts
import { Statistics } from "numwiz";

const data = [2, 4, 4, 4, 5, 5, 7, 9];
```

| Method           | Signature           | Description           | Example                                                 |
| ---------------- | ------------------- | --------------------- | ------------------------------------------------------- |
| `sum`            | `(arr)`             | Sum of array          | `Statistics.sum(data)` → `40`                           |
| `mean`           | `(arr)`             | Arithmetic mean       | `Statistics.mean(data)` → `5`                           |
| `median`         | `(arr)`             | Middle value          | `Statistics.median(data)` → `4.5`                       |
| `mode`           | `(arr)`             | Most frequent values  | `Statistics.mode(data)` → `[4]`                         |
| `min`            | `(arr)`             | Minimum               | `Statistics.min(data)` → `2`                            |
| `max`            | `(arr)`             | Maximum               | `Statistics.max(data)` → `9`                            |
| `range`          | `(arr)`             | max - min             | `Statistics.range(data)` → `7`                          |
| `variance`       | `(arr)`             | Population variance   | `Statistics.variance(data)` → `3.5`                     |
| `stdDev`         | `(arr)`             | Population std dev    | `Statistics.stdDev(data)` → `≈1.87`                     |
| `sampleVariance` | `(arr)`             | Sample variance (n-1) | `Statistics.sampleVariance(data)` → `4`                 |
| `sampleStdDev`   | `(arr)`             | Sample std dev        | `Statistics.sampleStdDev(data)` → `2`                   |
| `percentile`     | `(arr, p)`          | p-th percentile       | `Statistics.percentile(data, 75)` → `5.5`               |
| `quartiles`      | `(arr)`             | Q1, Q2, Q3 object     | `Statistics.quartiles(data)` → `{Q1:4, Q2:4.5, Q3:5.5}` |
| `iqr`            | `(arr)`             | Interquartile range   | `Statistics.iqr(data)` → `1.5`                          |
| `geometricMean`  | `(arr)`             | Geometric mean        | `Statistics.geometricMean([1,2,4,8])` → `≈2.83`         |
| `harmonicMean`   | `(arr)`             | Harmonic mean         | `Statistics.harmonicMean([1,2,4])` → `≈1.71`            |
| `weightedMean`   | `(values, weights)` | Weighted average      | `Statistics.weightedMean([1,2,3],[1,2,1])` → `2`        |
| `zScore`         | `(value, arr)`      | Z-score               | `Statistics.zScore(9, data)` → `≈2.14`                  |
| `correlation`    | `(x, y)`            | Pearson correlation   | `Statistics.correlation([1,2,3],[2,4,6])` → `1`         |
| `frequency`      | `(arr)`             | Value counts map      | `Statistics.frequency([1,1,2,3])` → `{1:2, 2:1, 3:1}`   |
| `skewness`       | `(arr)`             | Distribution skewness | `Statistics.skewness(data)` → `≈0.95`                   |

---

### Financial

```ts
import { Financial } from "numwiz";
```

| Method                 | Signature                         | Description              | Example                                               |
| ---------------------- | --------------------------------- | ------------------------ | ----------------------------------------------------- |
| `simpleInterest`       | `(principal, rate, time)`         | SI = P×R×T/100           | `Financial.simpleInterest(10000, 5, 3)` → `1500`      |
| `compoundInterest`     | `(principal, rate, time, n?)`     | CI (default n=1/year)    | `Financial.compoundInterest(10000, 5, 3)` → `≈1576`   |
| `emi`                  | `(principal, annualRate, months)` | Monthly loan EMI         | `Financial.emi(500000, 10, 120)` → `≈6607`            |
| `futureValue`          | `(pv, rate, periods)`             | FV of investment         | `Financial.futureValue(10000, 8, 5)` → `≈14693`       |
| `presentValue`         | `(fv, rate, periods)`             | PV of future sum         | `Financial.presentValue(14693, 8, 5)` → `≈10000`      |
| `roi`                  | `(gain, cost)`                    | Return on investment %   | `Financial.roi(15000, 10000)` → `50`                  |
| `cagr`                 | `(start, end, years)`             | Compound annual growth % | `Financial.cagr(10000, 20000, 5)` → `≈14.87`          |
| `grossProfit`          | `(revenue, cogs)`                 | Revenue - COGS           | `Financial.grossProfit(50000, 30000)` → `20000`       |
| `grossMargin`          | `(revenue, cogs)`                 | Gross profit %           | `Financial.grossMargin(50000, 30000)` → `40`          |
| `netProfit`            | `(revenue, expenses)`             | Revenue - Expenses       | `Financial.netProfit(50000, 40000)` → `10000`         |
| `markup`               | `(cost, sellingPrice)`            | Markup % on cost         | `Financial.markup(30000, 50000)` → `≈66.67`           |
| `discount`             | `(original, discountPct)`         | Price after discount     | `Financial.discount(1000, 20)` → `800`                |
| `taxAmount`            | `(amount, taxRate)`               | Tax portion              | `Financial.taxAmount(1000, 18)` → `180`               |
| `priceWithTax`         | `(amount, taxRate)`               | Amount inclusive of tax  | `Financial.priceWithTax(1000, 18)` → `1180`           |
| `sipFutureValue`       | `(monthly, annualRate, years)`    | SIP maturity amount      | `Financial.sipFutureValue(5000, 12, 10)` → `≈1163390` |
| `amortizationSchedule` | `(principal, annualRate, months)` | Full amortization table  | Returns `AmortizationEntry[]`                         |

#### `amortizationSchedule` example

```ts
const schedule = Financial.amortizationSchedule(500000, 10, 12);
schedule[0];
// {
//   month: 1,
//   emi: 43956.46,
//   principal: 39789.79,
//   interest: 4166.67,
//   balance: 460210.21
// }
```

---

### Advanced

```ts
import { Advanced } from "numwiz";
```

#### Combinatorics

```ts
Advanced.factorial(5); // 120
Advanced.permutation(5, 2); // 20
Advanced.combination(5, 2); // 10
Advanced.catalan(5); // 42
Advanced.pascal(4); // [1, 4, 6, 4, 1]
```

#### Number Theory

```ts
Advanced.gcd(12, 8); // 4
Advanced.lcm(4, 6); // 12
Advanced.gcdArray([12, 8, 6]); // 2
Advanced.lcmArray([4, 6, 10]); // 60
Advanced.primeFactors(60); // [2, 2, 3, 5]
Advanced.divisors(12); // [1, 2, 3, 4, 6, 12]
Advanced.sumOfDivisors(12); // 28
Advanced.nextPrime(10); // 11
Advanced.primesInRange(10, 30); // [11, 13, 17, 19, 23, 29]
Advanced.eulerTotient(12); // 4
```

#### Sequences

```ts
Advanced.fibonacci(10); // 55   (10th Fibonacci number)
Advanced.fibonacciSequence(8); // [0, 1, 1, 2, 3, 5, 8, 13]
Advanced.collatz(6); // [6, 3, 10, 5, 16, 8, 4, 2, 1]
```

#### Digit Operations

```ts
Advanced.digitSum(12345); // 15
Advanced.digitalRoot(9875); // 2
Advanced.countDigits(12345); // 5
Advanced.reverseNumber(12345); // 54321
Advanced.isPalindrome(121); // true
```

#### Math Utilities

```ts
Advanced.lerp(0, 100, 0.5); // 50    (linear interpolation)
Advanced.inverseLerp(0, 100, 50); // 0.5   (inverse lerp)
Advanced.map(5, 0, 10, 0, 100); // 50    (remap from [0,10] to [0,100])
Advanced.percentageOf(15, 200); // 30    (15% of 200)
Advanced.whatPercent(30, 200); // 15    (30 is what% of 200)
Advanced.percentChange(80, 100); // 25    (% increase from 80 to 100)
```

---

### Sequences

```ts
import { Sequences } from "numwiz";
```

| Method       | Signature               | Description                  | Example                                         |
| ------------ | ----------------------- | ---------------------------- | ----------------------------------------------- |
| `fibonacci`  | `(count)`               | Fibonacci sequence           | `Sequences.fibonacci(6)` → `[0,1,1,2,3,5]`      |
| `lucas`      | `(count)`               | Lucas numbers                | `Sequences.lucas(5)` → `[2,1,3,4,7]`            |
| `primes`     | `(count)`               | First N primes               | `Sequences.primes(5)` → `[2,3,5,7,11]`          |
| `triangular` | `(count)`               | Triangular numbers           | `Sequences.triangular(5)` → `[1,3,6,10,15]`     |
| `square`     | `(count)`               | Square numbers               | `Sequences.square(5)` → `[1,4,9,16,25]`         |
| `cube`       | `(count)`               | Cube numbers                 | `Sequences.cube(5)` → `[1,8,27,64,125]`         |
| `arithmetic` | `(start, diff, count)`  | Arithmetic progression       | `Sequences.arithmetic(1, 2, 5)` → `[1,3,5,7,9]` |
| `geometric`  | `(start, ratio, count)` | Geometric progression        | `Sequences.geometric(1, 2, 5)` → `[1,2,4,8,16]` |
| `custom`     | `(count, fn)`           | Custom sequence via index fn | `Sequences.custom(4, i => i*i)` → `[0,1,4,9]`   |

```ts
// Custom sequence examples
Sequences.custom(5, (i) => 2 ** i); // [1, 2, 4, 8, 16]
Sequences.custom(5, (i) => i * 3 + 1); // [1, 4, 7, 10, 13]
```

---

### Random

```ts
import { Random } from "numwiz";
```

| Method         | Signature             | Description                         | Example                            |
| -------------- | --------------------- | ----------------------------------- | ---------------------------------- |
| `float`        | `()`                  | Random float `[0, 1)`               | `Random.float()`                   |
| `floatBetween` | `(min, max)`          | Random float in `[min, max)`        | `Random.floatBetween(1, 5)`        |
| `intBetween`   | `(min, max)`          | Random integer (inclusive)          | `Random.intBetween(1, 10)`         |
| `boolean`      | `()`                  | Random true/false                   | `Random.boolean()`                 |
| `coin`         | `()`                  | `"heads"` or `"tails"`              | `Random.coin()`                    |
| `dice`         | `(sides?)`            | Roll a die (default 6)              | `Random.dice(20)` → `1–20`         |
| `pick`         | `<T>(arr)`            | Random element                      | `Random.pick([10, 20, 30])`        |
| `shuffle`      | `<T>(arr)`            | Shuffled copy (new array)           | `Random.shuffle([1,2,3,4,5])`      |
| `sample`       | `<T>(arr, count)`     | Random subset                       | `Random.sample([1,2,3,4,5], 3)`    |
| `generateList` | `(count, min?, max?)` | N random integers (repeats allowed) | `Random.generateList(5, 1, 10)`    |
| `uniqueList`   | `(count, min?, max?)` | N unique random integers            | `Random.uniqueList(5, 1, 20)`      |
| `gaussian`     | `(mean?, stdDev?)`    | Normal distribution sample          | `Random.gaussian(0, 1)`            |
| `weighted`     | `<T>(items)`          | Weighted random pick                | See example below                  |
| `uuid`         | `()`                  | UUID v4 string                      | `Random.uuid()` → `"xxxxxxxx-..."` |

```ts
// Weighted random
Random.weighted([
  { value: "common", weight: 70 },
  { value: "rare", weight: 25 },
  { value: "epic", weight: 5 },
]);
// returns "common" ~70% of the time
```

---

### Range

```ts
import { Range } from "numwiz";
```

| Method     | Signature             | Description                   | Example                                              |
| ---------- | --------------------- | ----------------------------- | ---------------------------------------------------- |
| `create`   | `(start, end, step?)` | Generate number array         | `Range.create(1, 5)` → `[1,2,3,4,5]`                 |
| `includes` | `(num, min, max)`     | Check membership `[min, max]` | `Range.includes(5, 1, 10)` → `true`                  |
| `wrap`     | `(num, min, max)`     | Wrap around range             | `Range.wrap(370, 0, 360)` → `10`                     |
| `bounce`   | `(num, min, max)`     | Bounce / ping-pong            | `Range.bounce(7, 0, 5)` → `3`                        |
| `chunk`    | `(start, end, size)`  | Split range into chunks       | `Range.chunk(1, 9, 3)` → `[[1,2,3],[4,5,6],[7,8,9]]` |

```ts
Range.create(0, 10, 2); // [0, 2, 4, 6, 8, 10]
Range.create(10, 1, -3); // [10, 7, 4, 1]  (negative step)
Range.wrap(370, 0, 360); // 10
Range.bounce(7, 0, 5); // 3
Range.chunk(1, 9, 3); // [[1,2,3],[4,5,6],[7,8,9]]
```

---

### Currency

```ts
import { Currency } from "numwiz";
```

| Method              | Signature                      | Description                  | Example                                                           |
| ------------------- | ------------------------------ | ---------------------------- | ----------------------------------------------------------------- |
| `format`            | `(amount, currency?, locale?)` | Intl.NumberFormat formatting | `Currency.format(1234567, "USD")` → `"$1,234,567.00"`             |
| `formatIndian`      | `(amount, symbol?)`            | Indian comma grouping        | `Currency.formatIndian(1234567, "₹")` → `"₹12,34,567.00"`         |
| `getSymbol`         | `(code)`                       | Currency symbol lookup       | `Currency.getSymbol("INR")` → `"₹"`                               |
| `convert`           | `(amount, fromRate, toRate)`   | Currency rate conversion     | `Currency.convert(100, 1, 83)` → `8300`                           |
| `abbreviateWestern` | `(amount, symbol?, decimals?)` | Western abbreviation         | `Currency.abbreviateWestern(1500000, "$")` → `"$1.5M"`            |
| `abbreviateIndian`  | `(amount, symbol?, decimals?)` | Indian abbreviation          | `Currency.abbreviateIndian(1500000, "₹")` → `"₹15.0 L"`           |
| `toWords`           | `(amount, currency?, locale?)` | Western scale words          | `Currency.toWords(150, "USD")` → `"one hundred fifty dollars"`    |
| `toWordsIndian`     | `(amount, currency?, locale?)` | Indian-scale words           | `Currency.toWordsIndian(150, "INR", "hi")` → `"एक सौ पचास रुपये"` |
| `toWordsHindi`      | `(amount, currency?)`          | Hindi convenience method     | `Currency.toWordsHindi(1500)` → `"पंद्रह सौ रुपये"`               |

**Supported currency symbols:** `USD ($)`, `EUR (€)`, `GBP (£)`, `INR (₹)`, `JPY/CNY (¥)`, `AUD (A$)`, `CAD (C$)`, `BDT (৳)`, `PKR (₨)`, `BRL (R$)`, `RUB (₽)`, `KRW (₩)`, `TRY (₺)`, `THB (฿)`, `PHP (₱)`, `VND (₫)`, `NGN (₦)`, and more.

---

### NumberWords

Direct access to the multi-locale word conversion engine.

```ts
import { NumberWords } from "numwiz";

NumberWords.toWords(42); // "forty-two"
NumberWords.toWords(42, "hi"); // "बयालीस"
NumberWords.toWords(42, "de"); // "zweiundvierzig"
NumberWords.toWords(42, "es"); // "cuarenta y dos"
NumberWords.toWords(42, "fr"); // "quarante-deux"
NumberWords.toWords(1000000, "en", "indian"); // "ten lakh"
NumberWords.toWords(1000000, "en", "western"); // "one million"
NumberWords.toWordsIndian(1500000, "en"); // "fifteen lakh"
NumberWords.toWordsWestern(1500000, "en"); // "one million five hundred thousand"
NumberWords.currencyToWords(150, "USD", "en", "western"); // "one hundred fifty dollars"
```

---

### Matrix

Full-featured matrix library with both a **static functional API** (plain arrays in, plain arrays out) and a **chainable instance API** (fluent builder pattern).

```ts
import { Matrix } from "numwiz";
// or via subpath
import Matrix from "numwiz/matrix";
```

#### Creation

| Method         | Signature                             | Description              | Example                                    |
| -------------- | ------------------------------------- | ------------------------ | ------------------------------------------ |
| `create`       | `(rows, cols, fill?)`                 | Matrix filled with value | `Matrix.create(2,3)` → `[[0,0,0],[0,0,0]]` |
| `identity`     | `(n)`                                 | n×n identity             | `Matrix.identity(3)`                       |
| `zeros`        | `(rows, cols)`                        | All zeros                | `Matrix.zeros(2,2)`                        |
| `ones`         | `(rows, cols)`                        | All ones                 | `Matrix.ones(2,2)`                         |
| `fill`         | `(rows, cols, v)`                     | Filled with `v`          | `Matrix.fill(2,2,7)`                       |
| `diagonal`     | `(values)`                            | Diagonal matrix          | `Matrix.diagonal([1,2,3])`                 |
| `random`       | `(rows, cols, min?, max?, integers?)` | Random matrix            | `Matrix.random(3,3,0,10,true)`             |
| `fromFlat`     | `(flat, rows, cols)`                  | Reshape 1D to 2D         | `Matrix.fromFlat([1,2,3,4],2,2)`           |
| `columnVector` | `(values)`                            | n×1 matrix               | `Matrix.columnVector([1,2,3])`             |
| `rowVector`    | `(values)`                            | 1×n matrix               | `Matrix.rowVector([1,2,3])`                |
| `rotation2D`   | `(angle)`                             | 2×2 rotation             | `Matrix.rotation2D(Math.PI/2)`             |
| `scaling`      | `(...factors)`                        | Diagonal scale matrix    | `Matrix.scaling(2,3)`                      |
| `hilbert`      | `(n)`                                 | Hilbert matrix           | `Matrix.hilbert(3)`                        |
| `vandermonde`  | `(values, cols)`                      | Vandermonde matrix       | `Matrix.vandermonde([1,2,3],4)`            |

#### Inspection

```ts
const m = [
  [1, 2, 3],
  [4, 5, 6],
];

Matrix.shape(m); // [2, 3]
Matrix.rows(m); // 2
Matrix.cols(m); // 3
Matrix.size(m); // 6
Matrix.get(m, 0, 1); // 2
Matrix.set(m, 0, 0, 9); // [[9,2,3],[4,5,6]]  (returns new matrix)
Matrix.getRow(m, 1); // [4, 5, 6]
Matrix.getCol(m, 0); // [1, 4]
Matrix.getDiagonal(m); // [1, 5]
Matrix.flatten(m); // [1,2,3,4,5,6]
Matrix.clone(m); // deep copy
```

#### Arithmetic

```ts
const A = [
    [1, 2],
    [3, 4],
  ],
  B = [
    [5, 6],
    [7, 8],
  ];

Matrix.add(A, B); // [[6,8],[10,12]]
Matrix.subtract(A, B); // [[-4,-4],[-4,-4]]
Matrix.multiply(A, B); // [[19,22],[43,50]]
Matrix.scale(A, 3); // [[3,6],[9,12]]
Matrix.negate(A); // [[-1,-2],[-3,-4]]
Matrix.hadamard(A, B); // [[5,12],[21,32]]
Matrix.elementDivide(A, B); // element-wise division
Matrix.elementPower(A, 2); // [[1,4],[9,16]]
Matrix.power(A, 3); // A³
Matrix.scalarAdd(A, 10); // [[11,12],[13,14]]
Matrix.scalarSubtract(A, 1); // [[0,1],[2,3]]
```

#### Transformations

```ts
Matrix.transpose([
  [1, 2, 3],
  [4, 5, 6],
]); // [[1,4],[2,5],[3,6]]
Matrix.inverse([
  [4, 7],
  [2, 6],
]); // [[0.6,-0.7],[-0.2,0.4]]
Matrix.adjugate(A);
Matrix.cofactor(A, 0, 0); // cofactor at [0,0]
Matrix.cofactorMatrix(A);
Matrix.minor(A, 0, 0); // sub-matrix without row 0 col 0
```

#### Row / Column Operations

```ts
Matrix.swapRows(A, 0, 1);
Matrix.swapCols(A, 0, 1);
Matrix.scaleRow(A, 0, 2);
Matrix.addRowMultiple(A, 1, 0, -2); // row1 += -2 * row0
Matrix.ref(A); // row echelon form
Matrix.rref(A); // reduced row echelon form
```

#### Scalar Properties

```ts
Matrix.determinant([
  [1, 2],
  [3, 4],
]); // -2
Matrix.trace([
  [1, 2],
  [3, 4],
]); // 5
Matrix.rank([
  [1, 2],
  [2, 4],
]); // 1
Matrix.sum(A); // 10
Matrix.min(A); // 1
Matrix.max(A); // 4
Matrix.mean(A); // 2.5
Matrix.normFrobenius(A); // ≈5.477
Matrix.normInf(A); // max absolute row sum
Matrix.norm1(A); // max absolute col sum
Matrix.sumAxis(A, "row"); // [3, 7]
Matrix.sumAxis(A, "col"); // [4, 6]
```

#### Decomposition & Solving

```ts
const { L, U, P } = Matrix.lu(A); // PA = LU
const { Q, R } = Matrix.qr(A); // A = QR
Matrix.eigenvalues([
  [2, 1],
  [1, 2],
]); // [3, 1]
Matrix.eigenvalues2x2([
  [0, -1],
  [1, 0],
]); // [{ real:0, imag:1 }, ...]
Matrix.solve(
  [
    [2, 1],
    [1, 3],
  ],
  [5, 10]
); // [[1],[3]]
Matrix.solveCramer(
  [
    [2, 1],
    [1, 3],
  ],
  [5, 10]
); // [[1],[3]]
```

#### Boolean Checks

```ts
Matrix.isSquare(A); // true
Matrix.isIdentity(Matrix.identity(3)); // true
Matrix.isSymmetric([
  [1, 2],
  [2, 1],
]); // true
Matrix.isDiagonal(Matrix.diagonal([1, 2])); // true
Matrix.isUpperTriangular([
  [1, 2],
  [0, 3],
]); // true
Matrix.isLowerTriangular([
  [1, 0],
  [2, 3],
]); // true
Matrix.isOrthogonal(Matrix.identity(2)); // true
Matrix.isSingular([
  [1, 2],
  [2, 4],
]); // true
Matrix.isZero(Matrix.zeros(2, 2)); // true
Matrix.isVector([[1, 2, 3]]); // true
Matrix.isRowVector([[1, 2, 3]]); // true
Matrix.isColumnVector([[1], [2], [3]]); // true
Matrix.isSameShape(A, B); // true
Matrix.equals(A, A); // true
Matrix.isEqual(A, A, 1e-10); // true
```

#### Vector Operations

```ts
Matrix.dot([1, 2, 3], [4, 5, 6]); // 32
Matrix.cross([1, 0, 0], [0, 1, 0]); // [0,0,1]
Matrix.magnitude([3, 4]); // 5
Matrix.normalize([3, 4]); // [0.6, 0.8]
Matrix.angleBetween([1, 0], [0, 1]); // Math.PI/2
```

#### Aggregation

```ts
Matrix.rowSums(m); // n×1 column vector of row sums
Matrix.colSums(m); // 1×n row vector of col sums
Matrix.rowMeans(m); // n×1 column vector of row means
Matrix.colMeans(m); // 1×n row vector of col means
```

#### Functional / Element-wise

```ts
Matrix.map(m, (v, i, j) => v * 2); // double every element
Matrix.forEach(m, (v, i, j) => {}); // iterate (returns void)
Matrix.every(m, (v) => v > 0); // true if all elements match
Matrix.some(m, (v) => v > 5); // true if any element matches
Matrix.round(m, 2); // round to 2 decimal places
Matrix.abs(m); // |element| for all elements
```

#### Structure

```ts
Matrix.hStack(A, B); // horizontal concat (same rows)
Matrix.vStack(A, B); // vertical concat (same cols)
Matrix.hConcat(A, B); // alias for hStack
Matrix.vConcat(A, B); // alias for vStack
Matrix.slice(m, 0, 0, 2, 2); // sub-matrix [start, end) exclusive
Matrix.subMatrix(m, 0, 0, 2, 2); // alias for slice
Matrix.reshape([[1, 2, 3, 4, 5, 6]], 2, 3); // [[1,2,3],[4,5,6]]
```

#### Display

```ts
Matrix.toString(A); // formatted grid with box-drawing chars
Matrix.print(A); // console.log + returns matrix
Matrix.toHTML(A); // <table> HTML string
Matrix.toJSON(A); // { rows: 2, cols: 2, data: [[...]] }
Matrix.fromJSON(json); // number[][] from JSON object
```

#### Chainable Instance API

````ts
const result = new Matrix([
  [1, 2],
  [3, 4],
])
  .add([
    [10, 20],
    [30, 40],
  ])
  .multiply([
    [1, 0],
    [0, 1],
  ])
  .scale(2)
  .transpose()
  .round(4)
  .toArray(); // → number[][]

// Scalar terminal methods
new Matrix([
  [1, 2],
  [3, 4],
]).determinant(); // -2
new Matrix([
  [1, 2],
  [3, 4],
]).trace(); // 5

// Boolean terminal methods
new Matrix([
  [1, 0],
  [0, 1],
]).isIdentity(); // true

// Decomposition & solving
const { L, U, P } = new Matrix(A).lu();
const { Q, R } = new Matrix(A).qr();
new Matrix([
  [2, 1],
  [1, 3],
])
  .solve([[5], [10]])
  .toArray(); // [[1],[3]]
```

**Chainable methods:** `add`, `subtract`, `multiply`, `scale`, `negate`, `hadamard`, `elementDivide`, `elementPower`, `power`, `scalarAdd`, `scalarSubtract`, `transpose`, `inverse`, `adjugate`, `ref`, `rref`, `solve`, `hStack`, `vStack`, `slice`, `reshape`, `swapRows`, `swapCols`, `map`, `round`, `abs`, `clone`, `print`

**Terminal methods:** `toArray`, `flatten`, `getDiagonal`, `getRows`, `getCols`, `getShape`, `getSize`, `getElement`, `determinant`, `trace`, `sum`, `min`, `max`, `mean`, `rank`, `norm`, `normFrobenius`, `eigenvalues`, `isSquare`, `isIdentity`, `isSymmetric`, `isDiagonal`, `isUpperTriangular`, `isLowerTriangular`, `isOrthogonal`, `isSingular`, `isZero`, `equals`, `isEqual`, `toString`, `lu`, `qr`

---

### NDArray

N-dimensional array with numpy-inspired API. The core building block for all scientific computing modules.

```ts
import { NDArray } from "numwiz";
````

#### Creation

```ts
NDArray.zeros([2, 3]); // 2×3 array of zeros
NDArray.ones([2, 3]); // 2×3 array of ones
NDArray.full([2, 2], 7); // 2×2 filled with 7
NDArray.eye(3); // 3×3 identity
NDArray.arange(0, 5); // [0, 1, 2, 3, 4]
NDArray.arange(0, 1, 0.2); // [0, 0.2, 0.4, 0.6, 0.8]
NDArray.linspace(0, 1, 5); // [0, 0.25, 0.5, 0.75, 1]
NDArray.logspace(0, 2, 3); // [1, 10, 100]
NDArray.geomspace(1, 8, 4); // [1, 2, 4, 8]
NDArray.from([
  [1, 2],
  [3, 4],
]); // 2D from nested array
NDArray.diag([1, 2, 3]); // diagonal matrix
```

#### Shape & Indexing

```ts
const a = NDArray.arange(0, 12).reshape([3, 4]);
a.shape; // [3, 4]
a.ndim; // 2
a.size; // 12
a.get(0, 1); // 1
a.set(0, 0, 99); // returns new NDArray
a.flatten(); // 1D NDArray
a.transpose(); // 4×3 NDArray — also a.T
a.squeeze(); // remove length-1 dimensions
a.expandDims(0); // insert new axis at position 0
a.swapaxes(0, 1); // swap axes
a.slice([
  [0, 2],
  [1, 3],
]); // sub-array
```

#### Element-wise Math

```ts
const b = NDArray.from([4, 9, 16]);
NDArray.sqrt(b).toArray(); // [2, 3, 4]
NDArray.abs(b);
NDArray.exp(b);
NDArray.log(b); // natural log
NDArray.sin(b);
NDArray.cos(b);
NDArray.floor(b);
NDArray.ceil(b);
NDArray.round(b);
NDArray.square(b); // element-wise b²
NDArray.clip(b, 5, 12); // clamp to [5, 12]
NDArray.add(b, b); // element-wise sum
NDArray.subtract(b, b);
NDArray.multiply(b, b);
NDArray.divide(b, b);
NDArray.power(b, 2);
NDArray.maximum(b, b);
NDArray.minimum(b, b);
```

#### Reductions

```ts
const c = NDArray.from([
  [1, 2, 3],
  [4, 5, 6],
]);
c.sum(); // 21   (all elements)
c.sum(0).toArray(); // [5, 7, 9]  (column sums)
c.sum(1).toArray(); // [6, 15]    (row sums)
c.mean();
c.std();
c.variance();
c.min();
c.max();
c.product();
c.argmin();
c.argmax();
c.cumsum().toArray();
c.nonzero();
```

#### Matrix Operations

```ts
const m = NDArray.from([
  [1, 2],
  [3, 4],
]);
m.dot(m).toArray(); // [[7,10],[15,22]]
NDArray.dot(m, m);
m.trace(); // 5
m.diagonal().toArray(); // [1, 4]
```

#### Stack / Combine

```ts
NDArray.concatenate([a, b], 0); // stack along axis 0
NDArray.stack([a, b]); // new axis
NDArray.hstack([a, b]);
NDArray.vstack([a, b]);
```

---

### LinAlg

Linear algebra on 2D arrays (equivalent to `numpy.linalg`).

```ts
import { LinAlg } from "numwiz";

const A = [
  [1, 2],
  [3, 4],
];
```

| Method       | Description                                | Example                                    |
| ------------ | ------------------------------------------ | ------------------------------------------ |
| `inv`        | Matrix inverse                             | `LinAlg.inv(A)` → `[[-2,1],[1.5,-0.5]]`    |
| `det`        | Determinant                                | `LinAlg.det(A)` → `-2`                     |
| `eig`        | Eigenvalues + eigenvectors                 | `LinAlg.eig(A)` → `{ values, vectors }`    |
| `eigvals`    | Eigenvalues only                           | `LinAlg.eigvals(A)` → `[5.37, -0.37]`      |
| `svd`        | Singular value decomposition               | `LinAlg.svd(A)` → `{ U, S, Vt }`           |
| `solve`      | Solve Ax = b                               | `LinAlg.solve(A, [1,2])` → `[0, 0.5]`      |
| `qr`         | QR decomposition                           | `LinAlg.qr(A)` → `{ Q, R }`                |
| `lu`         | LU decomposition                           | `LinAlg.lu(A)` → `{ L, U, P }`             |
| `cholesky`   | Cholesky decomposition (positive-definite) | `LinAlg.cholesky([[4,2],[2,3]])` → `{ L }` |
| `pinv`       | Moore-Penrose pseudo-inverse               | `LinAlg.pinv(A)`                           |
| `lstsq`      | Least-squares solution                     | `LinAlg.lstsq(A, b)`                       |
| `norm`       | Matrix / vector norm                       | `LinAlg.norm(A)` → Frobenius norm          |
| `matrixRank` | Rank via SVD                               | `LinAlg.matrixRank(A)` → `2`               |
| `trace`      | Sum of diagonal elements                   | `LinAlg.trace(A)` → `5`                    |
| `kron`       | Kronecker product                          | `LinAlg.kron(A, B)`                        |
| `cond`       | Condition number                           | `LinAlg.cond(A)`                           |
| `solveLower` | Forward substitution (lower triangular)    | `LinAlg.solveLower(L, b)`                  |
| `solveUpper` | Back substitution (upper triangular)       | `LinAlg.solveUpper(U, b)`                  |
| `dot`        | Matrix / vector dot product                | `LinAlg.dot(A, B)`                         |

```ts
// Solve a linear system
const { values, vectors } = LinAlg.eig([
  [2, 1],
  [1, 2],
]);
values; // [3, 1]

// SVD
const { U, S, Vt } = LinAlg.svd([
  [1, 2],
  [3, 4],
]);
```

---

### Polynomial

Polynomial arithmetic, evaluation, root-finding and fitting.

```ts
import { PolyModule, Polynomial } from "numwiz";
```

#### `PolyModule` — static utility methods

| Method       | Description                     | Example                                         |
| ------------ | ------------------------------- | ----------------------------------------------- |
| `fromRoots`  | Build poly from roots           | `PolyModule.fromRoots([1, 2])` → `x²-3x+2`      |
| `eval`       | Evaluate at a point             | `PolyModule.eval([1, -3, 2], 3)` → `2`          |
| `add`        | Add two polynomials             | `PolyModule.add([1, 2], [3, 4])`                |
| `sub`        | Subtract polynomials            |                                                 |
| `mul`        | Multiply polynomials            | `PolyModule.mul([1, 2], [1, 3])` → `[1,5,6]`    |
| `divmod`     | Polynomial division + remainder | `PolyModule.divmod(p, d)` → `{ q, r }`          |
| `derivative` | Differentiate                   | `PolyModule.derivative([3, 2, 1])` → `[6, 2]`   |
| `integrate`  | Integrate (with const C)        | `PolyModule.integrate([3, 2, 1])` → `[1,1,1,0]` |
| `roots`      | Find all roots                  | `PolyModule.roots([1, -3, 2])` → `[2, 1]`       |
| `fit`        | Least-squares polynomial fit    | `PolyModule.fit(xs, ys, degree)`                |
| `gcd`        | Polynomial GCD                  |                                                 |
| `lcm`        | Polynomial LCM                  |                                                 |

#### `Polynomial` — chainable class

```ts
const p = new Polynomial([1, -3, 2]); // x² - 3x + 2

p.eval(3); // 2
p.degree(); // 2
p.derivative(); // Polynomial(2x - 3)
p.integrate(0); // Polynomial with constant 0
p.roots(); // [2, 1]
p.add(new Polynomial([1, 1])); // x² - 2x + 3
p.toString(); // "x^2 - 3x + 2"
```

---

### Calculus

Numerical differentiation and integration.

```ts
import { Calculus } from "numwiz";
```

#### Differentiation

| Method          | Description                                   | Example                                      |
| --------------- | --------------------------------------------- | -------------------------------------------- |
| `derivative`    | First derivative (central difference, h=1e-5) | `Calculus.derivative(x => x**3, 2)` → `≈12`  |
| `derivative2`   | Second derivative                             | `Calculus.derivative2(x => x**3, 2)` → `≈12` |
| `nthDerivative` | nth derivative at a point                     | `Calculus.nthDerivative(f, x, n)`            |
| `gradient`      | Gradient vector of a multivariate function    | `Calculus.gradient(f, [x, y])`               |
| `jacobian`      | Jacobian matrix                               | `Calculus.jacobian(fs, [x, y])`              |
| `hessian`       | Hessian matrix                                | `Calculus.hessian(f, [x, y])`                |
| `directional`   | Directional derivative                        | `Calculus.directional(f, point, direction)`  |
| `taylor`        | Taylor series coefficients                    | `Calculus.taylor(f, x0, n)`                  |

#### Integration

| Method       | Description                       | Example                                      |
| ------------ | --------------------------------- | -------------------------------------------- |
| `integrate`  | Adaptive Simpson's rule           | `Calculus.integrate(x => x**2, 0, 3)` → `≈9` |
| `trapezoid`  | Trapezoidal rule                  | `Calculus.trapezoid(f, 0, 1, 100)`           |
| `simpson`    | Composite Simpson's 1/3 rule      | `Calculus.simpson(f, 0, 1, 100)`             |
| `simpson38`  | Simpson's 3/8 rule                |                                              |
| `gauss5`     | 5-point Gauss–Legendre quadrature | `Calculus.gauss5(f, 0, 1)`                   |
| `romberg`    | Romberg integration               | `Calculus.romberg(f, 0, 1)` → high accuracy  |
| `monteCarlo` | Monte Carlo integration           | `Calculus.monteCarlo(f, 0, 1, 100000)`       |

#### Root-finding

| Method       | Description                        |
| ------------ | ---------------------------------- |
| `bisection`  | Bisection method                   |
| `newton`     | Newton-Raphson method              |
| `secant`     | Secant method                      |
| `fixedPoint` | Fixed-point iteration              |
| `brentq`     | Brent's method (robust bracketing) |

```ts
Calculus.derivative(Math.sin, 0); // ≈1 (cos 0)
Calculus.integrate((x) => x ** 2, 0, 3); // ≈9
Calculus.bisection((x) => x * x - 2, 1, 2); // ≈1.4142
Calculus.newton(
  (x) => x * x - 2,
  (x) => 2 * x,
  1
); // ≈1.4142
```

#### Optimization

| Method          | Description                       |
| --------------- | --------------------------------- |
| `minimize`      | Gradient descent minimization     |
| `goldenSection` | Golden-section search for minimum |

---

### FFT

Fast Fourier Transform for signal analysis.

```ts
import { FFT } from "numwiz";
```

| Method          | Description                                      |
| --------------- | ------------------------------------------------ | --- | ---- |
| `fft`           | Full complex FFT → NDArray of `{re, im}` objects |
| `ifft`          | Inverse FFT                                      |
| `rfft`          | Real FFT (only positive frequencies) → NDArray   |
| `irfft`         | Inverse real FFT                                 |
| `fftFreq`       | Frequency bins for a given sample size and rate  |
| `powerSpectrum` | Power spectrum `                                 | X   | ²/N` |
| `magnitude`     | Magnitude spectrum `                             | X   | `    |
| `phase`         | Phase spectrum (radians)                         |
| `fftShift`      | Shift zero-frequency component to centre         |
| `ifftShift`     | Inverse of `fftShift`                            |
| `nextPow2`      | Smallest power-of-2 ≥ n                          |
| `zeroPad`       | Zero-pad (or truncate) to length n               |
| `hanning`       | Hanning window                                   |
| `hamming`       | Hamming window                                   |
| `blackman`      | Blackman window                                  |
| `bartlett`      | Bartlett window                                  |
| `applyWindow`   | Multiply signal by a window function             |
| `stft`          | Short-time Fourier transform                     |

```ts
// Basic FFT
const X = FFT.fft([1, 0, -1, 0]);
// X = NDArray of complex objects {re, im}

// Frequencies for 8-point FFT at 1 kHz sample rate
FFT.fftFreq(8, 1 / 1000).toArray(); // [-500, -375, -250, -125, 0, 125, 250, 375]

// Power spectrum
FFT.powerSpectrum([1, 2, 3, 4]).toArray();

// Apply Hanning window before FFT
const windowed = FFT.applyWindow(signal, FFT.hanning(signal.length));
const spectrum = FFT.rfft(windowed);
```

---

### Interpolation

Numerical interpolation methods.

```ts
import { Interpolation, CubicSpline } from "numwiz";

const xs = [0, 1, 2, 3, 4];
const ys = [0, 1, 4, 9, 16];
```

| Method        | Description                             | Example                                     |
| ------------- | --------------------------------------- | ------------------------------------------- |
| `linear`      | Linear (piecewise) interpolation        | `Interpolation.linear(xs, ys, 1.5)` → `2.5` |
| `nearest`     | Nearest-neighbour interpolation         |                                             |
| `polynomial`  | Lagrange polynomial interpolation       | `Interpolation.polynomial(xs, ys, 2.5)`     |
| `barycentric` | Barycentric form (numerically stable)   |                                             |
| `newtonFwd`   | Newton forward-difference interpolation |                                             |
| `bilinear`    | 2D bilinear interpolation               | `Interpolation.bilinear(grid, x, y)`        |
| `bicubic`     | 2D bicubic interpolation (keys kernel)  |                                             |
| `runge`       | Runge phenomenon demo helper            |                                             |

#### `CubicSpline` — class

```ts
const spline = new CubicSpline(xs, ys); // natural cubic spline
spline.interpolate(2.5); // single point
spline.interpolate([0.5, 1.5, 2.5]); // array of points → number[]
```

---

### Signal

Digital signal processing utilities.

```ts
import { Signal } from "numwiz";
```

| Method              | Description                                          | Example                              |
| ------------------- | ---------------------------------------------------- | ------------------------------------ |
| `convolve`          | Discrete convolution                                 | `Signal.convolve([1,2,3], [1,1])`    |
| `correlate`         | Cross-correlation                                    |                                      |
| `firFilter`         | Apply a FIR filter                                   | `Signal.firFilter(signal, coeffs)`   |
| `firDesign`         | Design a FIR filter (window method)                  | `Signal.firDesign(cutoff, numTaps)`  |
| `movingAverage`     | Moving average (FIR low-pass)                        | `Signal.movingAverage(data, 5)`      |
| `downSample`        | Downsample by factor n                               | `Signal.downSample(data, 2)`         |
| `upSample`          | Upsample by factor n (zero insertion)                | `Signal.upSample(data, 2)`           |
| `zeroPad`           | Zero-pad to length n (truncates if n < length)       | `Signal.zeroPad(data, 16)`           |
| `normalize`         | Peak normalise to range [-1, 1]                      | `Signal.normalize(data)`             |
| `rms`               | Root mean square amplitude                           | `Signal.rms(data)`                   |
| `energy`            | Signal energy (sum of squares)                       | `Signal.energy(data)`                |
| `snr`               | Signal-to-noise ratio (dB)                           | `Signal.snr(signal, noise)`          |
| `thd`               | Total harmonic distortion                            | `Signal.thd(spectrum, fundamental)`  |
| `instantaneousFreq` | Instantaneous frequency via phase derivative         |                                      |
| `hilbert`           | Hilbert transform (analytic signal envelope)         | `Signal.hilbert(data)`               |
| `dtft`              | Discrete-time Fourier transform at given frequencies |                                      |
| `autocorrelation`   | Autocorrelation sequence                             | `Signal.autocorrelation(data)`       |
| `generateSine`      | Generate a sine wave                                 | `Signal.generateSine(freq, fs, dur)` |
| `generateSquare`    | Generate a square wave                               |                                      |
| `generateSawtooth`  | Generate a sawtooth wave                             |                                      |
| `addNoise`          | Add Gaussian noise                                   | `Signal.addNoise(data, stdDev)`      |

```ts
// Design and apply a low-pass FIR filter
const coeffs = Signal.firDesign(0.2, 31); // cutoff=0.2 (normalised), 31 taps
const filtered = Signal.firFilter(audioData, coeffs);

// Moving average smoothing
const smoothed = Signal.movingAverage(data, 5);

// Generate a 440 Hz tone at 44100 Hz for 1 second
const tone = Signal.generateSine(440, 44100, 1.0);

// SNR of recovered signal vs noise component
const snrDB = Signal.snr(cleanSignal, noiseArray);
```

---

### BigPrecision

Arbitrary-precision decimal arithmetic, analogous to Python's `decimal.Decimal`. Built on [`decimal.js`](https://mikemcl.github.io/decimal.js/).

```ts
import { BigPrecision, RoundingMode } from "numwiz";
```

#### The core floating-point problem

```ts
// JavaScript native floats
0.1 + 0.2 === 0.3; // false  (0.30000000000000004)

// BigPrecision — exact decimal arithmetic
new BigPrecision("0.1").add("0.2").toString(); // "0.3" ✓
```

#### Construction

```ts
new BigPrecision(42); // from integer
new BigPrecision("3.14159"); // from string — lossless
new BigPrecision(3.14); // from float (note: limited to JS float precision)
new BigPrecision(other); // copy from another BigPrecision
```

#### Arithmetic

```ts
const a = new BigPrecision("1.1");
const b = new BigPrecision("2.2");

a.add(b).toString(); // "3.3"
a.sub(b).toString(); // "-1.1"
a.mul(b).toString(); // "2.42"
a.div(b).toString(); // "0.5"    (may differ at high precision)
a.mod("0.7"); // "0.4"
a.pow("3"); // "1.331"
a.abs();
a.neg();
a.reciprocal(); // 1/a
```

#### Mathematical Functions

```ts
new BigPrecision("9").sqrt().toString(); // "3"
new BigPrecision("27").cbrt().toString(); // "3"
new BigPrecision("1").exp().toString(); // "2.71828182845904523536..." (e)
new BigPrecision("1").ln().toString(); // "0"   (ln(e)=1 → wait, ln(1)=0)
new BigPrecision("100").log10().toString(); // "2"
new BigPrecision("8").log2().toString(); // "3"
new BigPrecision("8").log(2).toString(); // "3"   (arbitrary base)
```

#### Rounding / Quantize

```ts
// Analogous to Python's quantize()
new BigPrecision("1.005").quantize(2).toString(); // "1.01"  (ROUND_HALF_UP)

// Custom rounding modes
new BigPrecision("2.5").quantize(0, RoundingMode.ROUND_HALF_EVEN).toString(); // "2"  (banker's)
new BigPrecision("1.999").quantize(2, RoundingMode.ROUND_DOWN).toString(); // "1.99"

new BigPrecision("3.7").ceil().toString(); // "4"
new BigPrecision("3.7").floor().toString(); // "3"
new BigPrecision("3.7").trunc().toString(); // "3"
```

#### Rounding Modes

| Constant                       | Description                   |
| ------------------------------ | ----------------------------- |
| `RoundingMode.ROUND_UP`        | Away from zero                |
| `RoundingMode.ROUND_DOWN`      | Toward zero (truncate)        |
| `RoundingMode.ROUND_CEIL`      | Toward +∞                     |
| `RoundingMode.ROUND_FLOOR`     | Toward −∞                     |
| `RoundingMode.ROUND_HALF_UP`   | Half away from zero (default) |
| `RoundingMode.ROUND_HALF_DOWN` | Half toward zero              |
| `RoundingMode.ROUND_HALF_EVEN` | Banker's rounding             |

#### Comparison

```ts
const a = new BigPrecision("3");
a.gt("2"); // true
a.lt("4"); // true
a.gte("3"); // true
a.lte("3"); // true
a.equals("3.0"); // true
a.compareTo("3"); // 0
a.isZero(); // false
a.isNegative(); // false
a.isInteger(); // true
```

#### Precision Control

```ts
// Default precision: 20 significant digits
BigPrecision.setPrecision(50);
BigPrecision.pi().toString();
// "3.14159265358979323846264338327950288419716939937510"

BigPrecision.setPrecision(100);
new BigPrecision("2").sqrt().toString();
// 100-digit √2

BigPrecision.getPrecision(); // 100
BigPrecision.setRoundingMode(RoundingMode.ROUND_HALF_EVEN);
```

#### Static Utilities

```ts
BigPrecision.pi(); // high-precision π
BigPrecision.e(); // high-precision e
BigPrecision.max("1", "5", "3"); // BigPrecision("5")
BigPrecision.min("1", "5", "3"); // BigPrecision("1")
BigPrecision.sum(["1.1", "2.2", "3.3"]); // BigPrecision("6.6")
```

#### Output

```ts
const v = new BigPrecision("3.14159265");
v.toString(); // "3.14159265"
v.toFixed(4); // "3.1416"
v.toSignificantDigits(5); // "3.1416"
v.toNumber(); // 3.14159265  (JS float, may lose precision)
v.toDecimal(); // underlying decimal.js Decimal instance
```

---

##nst { Q, R } = new Matrix(A).qr();
new Matrix([
[2, 1],
[1, 3],
])
.solve([[5], [10]])
.toArray(); // [[1],[3]]

````

**Chainable methods:** `add`, `subtract`, `multiply`, `scale`, `negate`, `hadamard`, `elementDivide`, `elementPower`, `power`, `scalarAdd`, `scalarSubtract`, `transpose`, `inverse`, `adjugate`, `ref`, `rref`, `solve`, `hStack`, `vStack`, `slice`, `reshape`, `swapRows`, `swapCols`, `map`, `round`, `abs`, `clone`, `print`

**Terminal methods:** `toArray`, `flatten`, `getDiagonal`, `getRows`, `getCols`, `getShape`, `getSize`, `getElement`, `determinant`, `trace`, `sum`, `min`, `max`, `mean`, `rank`, `norm`, `normFrobenius`, `eigenvalues`, `isSquare`, `isIdentity`, `isSymmetric`, `isDiagonal`, `isUpperTriangular`, `isLowerTriangular`, `isOrthogonal`, `isSingular`, `isZero`, `equals`, `isEqual`, `toString`, `lu`, `qr`

---

## Subpath Imports

Each module is independently importable for tree-shaking:

```ts
import Arithmetic from "numwiz/arithmetic";
import Comparison from "numwiz/comparison";
import Validation from "numwiz/validation";
import Conversion from "numwiz/conversion";
import Bitwise from "numwiz/bitwise";
import Trigonometry from "numwiz/trigonometry";
import Range from "numwiz/range";
import Statistics from "numwiz/statistics";
import Financial from "numwiz/financial";
import Sequences from "numwiz/sequences";
import Random from "numwiz/random";
import Advanced from "numwiz/advanced";
import Formatting from "numwiz/formatting";
import Currency from "numwiz/currency";
import Matrix from "numwiz/matrix";
import NumberWords from "numwiz/number-words";
// Scientific computing
import NDArray from "numwiz/ndarray";
import LinAlg from "numwiz/linalg";
import PolyModule, { Polynomial } from "numwiz/polynomial";
import Calculus from "numwiz/calculus";
import FFT from "numwiz/fft";
import Interpolation, { CubicSpline } from "numwiz/interpolation";
import Signal from "numwiz/signal";
// Arbitrary precision
import BigPrecision, { RoundingMode } from "numwiz/precision";

// Types only
import type { Matrix2D, LUResult, QRResult } from "numwiz/types";
````

---

## Supported Locales

| Code | Language | Preferred scale  |
| ---- | -------- | ---------------- |
| `en` | English  | Western & Indian |
| `hi` | Hindi    | Indian           |
| `de` | German   | Western          |
| `es` | Spanish  | Western          |
| `fr` | French   | Western          |
| `ar` | Arabic   | Western          |
| `bn` | Bengali  | Indian           |
| `mr` | Marathi  | Indian           |
| `gu` | Gujarati | Indian           |
| `ta` | Tamil    | Indian           |

### Examples

```ts
import { Formatting } from "numwiz";

Formatting.toWords(42, "en"); // "forty-two"
Formatting.toWords(42, "hi"); // "बयालीस"
Formatting.toWords(42, "de"); // "zweiundvierzig"
Formatting.toWords(42, "es"); // "cuarenta y dos"
Formatting.toWords(42, "fr"); // "quarante-deux"
Formatting.toWords(42, "ar"); // "اثنان وأربعون"
Formatting.toWords(42, "bn"); // "বিয়াল্লিশ"
Formatting.toWords(42, "mr"); // "बेचाळीस"
Formatting.toWords(42, "gu"); // "બેતાળીસ"
Formatting.toWords(42, "ta"); // "நாற்பத்திரண்டு"

Formatting.toOrdinal(1, "en"); // "1st"
Formatting.toOrdinal(3, "hi"); // "3वाँ"

// Indian scale
Formatting.toWords(10000000, "en", "indian"); // "one crore"
Formatting.toWords(10000000, "hi", "indian"); // "एक करोड़"
```

---

## TypeScript Support

NumWiz is written in TypeScript 5.x — types are bundled, no separate `@types/numwiz` needed.

```ts
import numwiz, {
  NumWiz,
  Arithmetic,
  Matrix,
  Statistics,
  Financial,
  type NumWizOptions,
} from "numwiz";
import type {
  Matrix2D,
  LUResult,
  QRResult,
  AmortizationEntry,
} from "numwiz/types";

const m: Matrix2D = [
  [1, 2],
  [3, 4],
];
const { L, U, P }: LUResult = Matrix.lu(m);
const schedule: AmortizationEntry[] = Financial.amortizationSchedule(
  500000,
  10,
  12
);
```

Key exported types:

| Type                | Description                                    |
| ------------------- | ---------------------------------------------- |
| `Matrix2D`          | `number[][]`                                   |
| `LUResult`          | `{ L: Matrix2D, U: Matrix2D, P: Matrix2D }`    |
| `QRResult`          | `{ Q: Matrix2D, R: Matrix2D }`                 |
| `EigenvalueResult`  | `number \| { real: number; imag: number }`     |
| `AmortizationEntry` | `{ month, emi, principal, interest, balance }` |
| `NumWizOptions`     | `{ safe?: boolean }`                           |
| `WeightedItem<T>`   | `{ value: T, weight: number }`                 |
| `LocaleData`        | Locale definition structure                    |
| `RoundingMode`      | Rounding mode constants for `BigPrecision`     |

---

## Error Reference

| Situation                           | Error type   | Examples                                           |
| ----------------------------------- | ------------ | -------------------------------------------------- |
| Invalid number input                | `TypeError`  | Non-number, NaN passed to strict method            |
| Wrong matrix dimensions             | `RangeError` | Non-square for inverse, size mismatch for multiply |
| Out-of-range index                  | `RangeError` | `Matrix.get(m, 99, 0)`                             |
| Division by zero (scalar)           | `Error`      | `Arithmetic.divide(10, 0)`                         |
| Division by zero (matrix)           | `Error`      | `Matrix.elementDivide(A, zeroMatrix)`              |
| Singular matrix                     | `Error`      | `Matrix.inverse(singularMatrix)`                   |
| Negative sqrt / log of non-positive | `RangeError` | `Arithmetic.sqrt(-1)` in non-safe mode             |
| Inverse trig out-of-domain          | `RangeError` | `Trigonometry.asin(2)`                             |
| Locale not registered               | `Error`      | Unknown locale code                                |
| Linearly dependent columns (QR)     | `Error`      | `Matrix.qr` on rank-deficient matrix               |
| BigPrecision: division by zero      | `Error`      | `new BigPrecision("5").div(0)`                     |
| BigPrecision: sqrt of negative      | `RangeError` | `new BigPrecision("-1").sqrt()`                    |
| BigPrecision: log of non-positive   | `RangeError` | `new BigPrecision("0").ln()`                       |
| BigPrecision: invalid log base      | `RangeError` | `new BigPrecision("8").log(1)`                     |
| BigPrecision: reciprocal of zero    | `Error`      | `new BigPrecision("0").reciprocal()`               |

> Use [`numwiz.safe()`](#safe-mode) on the chainable API to convert runtime errors into `NaN` values instead of throws.

---

## License

Proprietary. All rights reserved.

Use, modification, distribution, publication, sublicensing, sale, hosting, or derivative works require prior written permission from Subroto Saha. See [LICENSE](../LICENSE).
