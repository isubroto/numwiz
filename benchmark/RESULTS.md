# NumWiz Benchmark Report

Generated: 2026-05-06T14:46:43.339Z

## Methodology

- Run with `npm run bench`, which builds TypeScript and executes this benchmark with explicit GC enabled when available.
- Inputs are deterministic and generated from fixed seeds.
- Each workload is warmed up, calibrated into batches, and measured over multiple samples.
- Tables report medians and p95 timing. Raw samples are written to `benchmark/results.json`.
- Memory uses `process.memoryUsage().heapUsed` deltas after GC when available; treat this as a comparative signal.

## Environment

- Package: numwiz@1.3.0
- Node.js: v25.9.0
- Platform: linux x64
- CPU: AMD EPYC 7763 64-Core Processor
- Logical cores: 4
- RAM (GB): 15.62
- Explicit GC available: yes

## Results

| Category | Workload | Units/run | Median | p95 | Throughput | Heap/run | Batch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| arithmetic | validated floating-point reduction | 2,000 | 1.581e-2 ms | 1.588e-2 ms | 126,508,450 units/s | 5.101e-1 KB | 1024 |
| formatting | commas, abbreviations, and currency formatting | 600 | 21.81 ms | 22.06 ms | 27,513 units/s | 1,020 KB | 1 |
| statistics | mean, standard deviation, quartiles, skewness | 2,000 | 1.6993 ms | 1.7726 ms | 1,176,965 units/s | 237.22 KB | 16 |
| matrix | 8x8 multiply plus 4x4 solve | 512 | 4.938e-2 ms | 5.960e-2 ms | 10,369,099 units/s | 8.7443 KB | 256 |
| ndarray | vector add, multiply, and sum | 2,048 | 1.0712 ms | 1.1005 ms | 1,911,934 units/s | 242.31 KB | 16 |
| linalg | solve, inverse, and eigenvalues on small dense matrices | 16 | 1.519e-2 ms | 2.159e-2 ms | 1,053,645 units/s | 1.9353 KB | 1024 |
| fft | 512-sample real FFT and magnitude spectrum | 512 | 6.126e-2 ms | 7.647e-2 ms | 8,358,040 units/s | 14.28 KB | 256 |
| calculus | Simpson integration and finite-difference derivative | 1,000 | 1.189e-2 ms | 1.195e-2 ms | 84,103,557 units/s | 1.565e-1 KB | 2048 |
| precision | BigPrecision decimal accumulation | 200 | 5.184e-2 ms | 5.292e-2 ms | 3,858,044 units/s | 15.18 KB | 512 |
| chain | chain API arithmetic and rounding | 1,000 | 3.330e-3 ms | 3.388e-3 ms | 300,285,759 units/s | 5.531e-5 KB | 8192 |

## Accuracy Snapshot

- Decimal accumulation expected 100; native result 99.999999999998593; BigPrecision result 100.
- Native decimal absolute error: 1.4068746168049984e-12.
- BigPrecision decimal absolute error: 0.
- FFT round-trip max error: 0.
- Calculus integral absolute error for integral of x^2 from 0 to 3: 5.329070518200751e-15.

## Notes

- Native JavaScript remains the right tool for raw scalar throughput.
- NumWiz adds validation, module breadth, chain ergonomics, and decimal precision where those tradeoffs matter.
- BigPrecision is intentionally slower than `number` arithmetic but avoids IEEE-754 decimal accumulation errors.
