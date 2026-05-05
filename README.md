# NumWiz

> TypeScript number utilities for arithmetic, formatting, currency, number words, statistics, financial math, matrix algebra, NDArray, linear algebra, FFT, calculus, interpolation, signal processing, polynomials, and arbitrary-precision decimals.

[![npm version](https://img.shields.io/npm/v/numwiz.svg)](https://www.npmjs.com/package/numwiz)
[![npm downloads](https://img.shields.io/npm/dm/numwiz.svg)](https://www.npmjs.com/package/numwiz)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Build Status](https://img.shields.io/github/actions/workflow/status/isubroto/numwiz/ci.yml?branch=main)](https://github.com/isubroto/numwiz/actions)

## Install

```sh
npm install numwiz
```

NumWiz supports both CommonJS and ESM consumers, includes TypeScript declarations, and publishes subpath exports for smaller imports.

## Quick Start

```ts
import numwiz, {
  Arithmetic,
  BigPrecision,
  Calculus,
  FFT,
  LinAlg,
  Matrix,
  NDArray,
  Statistics,
} from "numwiz";

numwiz(50).add(50).multiply(2).abbreviate(); // "200"
Arithmetic.add(1, 2, 3, 4); // 10
Statistics.mean([1, 2, 3, 4, 5]); // 3

Matrix.determinant([
  [1, 2],
  [3, 4],
]); // -2

const a = NDArray.arange(0, 6).reshape([2, 3]);
a.shape; // [2, 3]

LinAlg.solve(
  [
    [2, 1],
    [1, 3],
  ],
  [5, 10]
).toArray(); // Float64Array [1, 3]

FFT.rfft([1, 0, -1, 0]);
Calculus.integrate((x) => x ** 2, 0, 3); // approximately 9

new BigPrecision("0.1").add("0.2").toString(); // "0.3"
```

## Import Styles

```ts
import numwiz, { Formatting, Matrix } from "numwiz";
import Arithmetic from "numwiz/arithmetic";
import NDArray from "numwiz/ndarray";
import LinAlg from "numwiz/linalg";
import BigPrecision from "numwiz/precision";
```

```js
const { numwiz, Arithmetic } = require("numwiz");
const Matrix = require("numwiz/matrix").default;
```

## API Shape

NumWiz keeps two public API styles:

| Style | Example | Best for |
| --- | --- | --- |
| Chain API | `numwiz(100).add(25).toCurrency("USD")` | Fluent single-number workflows |
| Static modules | `Statistics.mean(values)` | Direct, testable, tree-shakeable calls |

Main modules:

- Core numbers: `Arithmetic`, `Comparison`, `Validation`, `Conversion`, `Formatting`, `Currency`, `NumberWords`
- Math utilities: `Advanced`, `Financial`, `Range`, `Sequences`, `Random`, `SeededRandom`, `Trigonometry`
- Scientific computing: `Matrix`, `NDArray`, `LinAlg`, `Polynomial`, `Calculus`, `FFT`, `Interpolation`, `Signal`
- Precision: `BigPrecision`, `RoundingMode`

Detailed API reference lives in [docs/API.md](docs/API.md).

## Practical Examples

```ts
import { Currency, Financial, Matrix, NumberWords, Statistics } from "numwiz";

const subtotal = 1250 + 850;
const total = Financial.priceWithTax(subtotal, 15);
Currency.format(total, "BDT", "bn-BD"); // BDT-formatted invoice total

Financial.emi(1_000_000, 9.5, 120); // monthly loan payment

NumberWords.toWords(125000, "bn", "indian"); // Bangladesh-style taka words helper

Statistics.quartiles([10, 12, 13, 15, 18, 21]);

Matrix.solve(
  [
    [3, 2],
    [1, 2],
  ],
  [18, 10]
); // [[4], [3]]
```

More examples are in [docs/EXAMPLES.md](docs/EXAMPLES.md).

## Quality Gates

```sh
npm run typecheck
npm run lint
npm test
npm run coverage
npm run build
npm run package:validate
npm run bench
```

Benchmarks write a Markdown report and raw JSON to `benchmark/`. See [benchmark/README.md](benchmark/README.md) and [docs/VALIDATION.md](docs/VALIDATION.md).

## Packaging

- `main`: CommonJS build at `dist/index.js`
- `module`: ESM compatibility wrapper at `dist/index.mjs`
- `types`: bundled declarations at `dist/index.d.ts`
- `exports`: root and module subpaths with `types`, `import`, `require`, and `default`
- `sideEffects: false` for bundler tree-shaking metadata

## License

Proprietary. All rights reserved.

Use, modification, distribution, publication, sublicensing, sale, hosting, or derivative works require prior written permission from Subroto Saha. See [LICENSE](LICENSE).
