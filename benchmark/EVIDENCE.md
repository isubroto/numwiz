# Benchmark Evidence

This file indexes the current benchmark artifacts for NumWiz.

## Current Commands

```sh
npm run bench
npm run coverage
npm run build
npm run package:validate
```

`npm run bench` builds the package, runs the deterministic benchmark suite, and regenerates:

- `benchmark/RESULTS.md`
- `benchmark/results.json`

## Current Benchmark Coverage

The benchmark suite measures:

- Arithmetic
- Formatting
- Statistics
- Matrix
- NDArray
- LinAlg
- FFT
- Calculus
- Precision
- Chain API

## Generated Environment

The latest generated environment is recorded in `benchmark/RESULTS.md` and `benchmark/results.json`.

## Accuracy Snapshot

The benchmark output includes a small accuracy snapshot for:

- Decimal accumulation with native `number` versus `BigPrecision`
- FFT round-trip error
- Numerical integration error

The full accuracy and edge-case test suite lives in `test/accuracy-validation.test.ts` and `test/edge-cases.test.ts`.
