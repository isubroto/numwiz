# NumWiz Benchmark Report

Generated: 2026-05-05T15:16:51.117Z

## Methodology

- Run with `npm run bench`, which builds TypeScript and executes this benchmark with explicit GC enabled when available.
- Inputs are deterministic and generated from fixed seeds.
- Each workload is warmed up, calibrated into batches, and measured over multiple samples.
- Tables report medians and p95 timing. Raw samples are written to `benchmark/results.json`.
- Memory uses `process.memoryUsage().heapUsed` deltas after GC when available; treat this as a comparative signal.

## Environment

- Package: numwiz@1.2.0
- Node.js: v25.8.2
- Platform: win32 x64
- CPU: AMD Ryzen 7 4800H with Radeon Graphics
- Logical cores: 16
- RAM (GB): 15.42
- Explicit GC available: yes

## Results

| Category | Workload | Units/run | Median | p95 | Throughput | Heap/run | Batch |
| --- | --- | --- | --- | --- | --- | --- | --- |
| arithmetic | validated floating-point reduction | 2,000 | 1.490e-2 ms | 1.534e-2 ms | 134,196,525 units/s | 5.101e-1 KB | 1024 |
| formatting | commas, abbreviations, and currency formatting | 600 | 24.27 ms | 25.20 ms | 24,717 units/s | 1,020 KB | 1 |
| statistics | mean, standard deviation, quartiles, skewness | 2,000 | 1.5193 ms | 1.6275 ms | 1,316,407 units/s | 237.22 KB | 16 |
| matrix | 8x8 multiply plus 4x4 solve | 512 | 6.274e-2 ms | 7.231e-2 ms | 8,160,988 units/s | 8.6718 KB | 256 |
| ndarray | vector add, multiply, and sum | 2,048 | 1.2547 ms | 1.2787 ms | 1,632,238 units/s | 242.35 KB | 16 |
| linalg | solve, inverse, and eigenvalues on small dense matrices | 16 | 1.565e-2 ms | 1.980e-2 ms | 1,022,166 units/s | 2.3061 KB | 1024 |
| fft | 512-sample real FFT and magnitude spectrum | 512 | 9.860e-2 ms | 1.114e-1 ms | 5,192,924 units/s | 14.40 KB | 256 |
| calculus | Simpson integration and finite-difference derivative | 1,000 | 1.272e-2 ms | 1.505e-2 ms | 78,596,620 units/s | 1.565e-1 KB | 2048 |
| precision | BigPrecision decimal accumulation | 200 | 5.786e-2 ms | 6.716e-2 ms | 3,456,820 units/s | 15.20 KB | 256 |
| chain | chain API arithmetic and rounding | 1,000 | 3.022e-3 ms | 3.062e-3 ms | 330,897,649 units/s | 5.531e-5 KB | 8192 |

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
