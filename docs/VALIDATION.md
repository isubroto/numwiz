# Validation and Release Checks

NumWiz uses three layers of validation: unit tests, accuracy tests, and package smoke tests.

## Accuracy Tests

The test suite includes accuracy validation for:

- `Matrix`: determinant, inverse, solve, and identity reconstruction
- `NDArray`: reshaping, dot products, reductions, and scalar in-place operations
- `LinAlg`: solve, inverse, eigenvalues, and Cholesky
- `FFT`: round-trip transforms and tone-bin detection
- `Calculus`: integration, differentiation, and root finding
- `Interpolation`: linear, polynomial, and cubic spline interpolation
- `Signal`: convolution, energy, and normalization
- `Polynomial`: roots, derivatives, integrals, and least-squares fitting
- `Statistics`: means, sample variance, and correlation
- `BigPrecision`: decimal-sensitive arithmetic

Run them with:

```sh
npm test
```

## Edge Cases

The suite also checks:

- Empty input
- Invalid input
- `NaN`
- `Infinity`
- Division by zero
- Shape mismatch
- Invalid locale and currency values
- Very large and very small numbers

Runtime errors are expected to include the module, method, problem, expected input, and received input when useful.

## Package Validation

After `npm run build`, package validation checks:

- `exports` targets exist
- CommonJS root import works
- ESM root import works
- CommonJS subpath import works
- ESM subpath import works
- `npm pack --dry-run` succeeds

```sh
npm run build
npm run package:validate
```

## Benchmarks

`npm run bench` builds the package and writes:

- `benchmark/RESULTS.md`
- `benchmark/results.json`

Benchmark groups include arithmetic, formatting, statistics, matrix, NDArray, LinAlg, FFT, calculus, precision, and chain API workloads.
