# NumWiz Benchmarks

This directory contains repeatable benchmarks comparing NumWiz calculations with native JavaScript arithmetic.

## Run

```sh
npm run bench
```

The script builds the package first, then runs:

```sh
node --expose-gc benchmark/native-vs-numwiz.js
```

## Outputs

- `benchmark/RESULTS.md`: human-readable tables and findings.
- `benchmark/results.json`: raw samples, environment metadata, batch sizes, and summaries.

## Methodology

- Workloads cover arithmetic, formatting, statistics, matrix, NDArray, LinAlg, FFT, calculus, precision, and the chain API.
- Decimal accumulation compares native `number` addition with `BigPrecision`.
- Inputs are deterministic, using a fixed seed for generated floating-point arrays.
- Each workload is warmed up before measurement.
- Small workloads are automatically batched to reduce timer noise.
- Report tables use median timings. Raw JSON includes mean, median, p95, standard deviation, min, max, and every sample.
- Memory is estimated from `process.memoryUsage().heapUsed` deltas after explicit GC when available. This is useful for relative comparison, but it is not a replacement for a dedicated allocation profiler.

## Configuration

You can tune benchmark behavior with environment variables:

- `BENCH_WARMUP_RUNS`
- `BENCH_MEASURE_RUNS`
- `BENCH_TARGET_MS`
- `BENCH_MAX_BATCH_RUNS`

For example:

```sh
BENCH_MEASURE_RUNS=21 npm run bench
```

PowerShell:

```powershell
$env:BENCH_MEASURE_RUNS = "21"; npm run bench
```
