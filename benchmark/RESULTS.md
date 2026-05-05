# NumWiz Benchmark Report

Generated: 2026-05-05T14:41:17.828Z

## Methodology

- Run with `npm run bench`, which builds TypeScript and executes this benchmark with explicit GC enabled when available.
- Inputs are deterministic and generated from fixed seeds.
- Each workload is warmed up, calibrated into batches, and measured over multiple samples.
- Tables report medians and p95 timing. Raw samples are written to `benchmark/results.json`.
- Memory uses `process.memoryUsage().heapUsed` deltas after GC when available; treat this as a comparative signal.

## Environment

- Package: numwiz@1.1.2
- Node.js: v25.8.2
- Platform: win32 x64
- CPU: AMD Ryzen 7 4800H with Radeon Graphics
- Logical cores: 16
- RAM (GB): 15.42
- Explicit GC available: yes

## Results

| Category | Workload | Units/run | Median | p95 | Throughput | Heap/run | Batch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| arithmetic | validated floating-point reduction | 2,000 | 1.580e-2 ms | 1.674e-2 ms | 126,594,798 units/s | 5.101e-1 KB | 1024 |
| formatting | commas, abbreviations, and currency formatting | 600 | 25.91 ms | 26.69 ms | 23,155 units/s | 1,020 KB | 1 |
| statistics | mean, standard deviation, quartiles, skewness | 2,000 | 1.6536 ms | 1.9523 ms | 1,209,473 units/s | 504.38 KB | 8 |
| matrix | 8x8 multiply plus 4x4 solve | 512 | 6.928e-2 ms | 7.497e-2 ms | 7,390,125 units/s | 8.6935 KB | 256 |
| ndarray | vector add, multiply, and sum | 2,048 | 1.3334 ms | 1.3558 ms | 1,535,866 units/s | 242.35 KB | 16 |
| linalg | solve, inverse, and eigenvalues on small dense matrices | 16 | 1.495e-2 ms | 1.935e-2 ms | 1,069,899 units/s | 2.1612 KB | 1024 |
| fft | 512-sample real FFT and magnitude spectrum | 512 | 1.000e-1 ms | 1.156e-1 ms | 5,119,360 units/s | 45.98 KB | 128 |
| calculus | Simpson integration and finite-difference derivative | 1,000 | 1.352e-2 ms | 1.388e-2 ms | 73,962,253 units/s | 1.565e-1 KB | 2048 |
| precision | BigPrecision decimal accumulation | 200 | 6.361e-2 ms | 6.756e-2 ms | 3,144,094 units/s | 15.20 KB | 256 |
| chain | chain API arithmetic and rounding | 1,000 | 3.065e-3 ms | 3.104e-3 ms | 326,282,207 units/s | 5.531e-5 KB | 8192 |

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
