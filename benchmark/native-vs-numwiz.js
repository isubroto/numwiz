"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { performance } = require("node:perf_hooks");

const packageJson = require("../package.json");
const {
  Arithmetic,
  BigPrecision,
  Calculus,
  Currency,
  FFT,
  Formatting,
  LinAlg,
  Matrix,
  NDArray,
  Statistics,
  default: numwiz,
} = require(path.join(__dirname, "..", "dist", "index.js"));

const WARMUP_RUNS = numberFromEnv("BENCH_WARMUP_RUNS", 3);
const MEASURE_RUNS = numberFromEnv("BENCH_MEASURE_RUNS", 7);
const TARGET_SAMPLE_MS = numberFromEnv("BENCH_TARGET_MS", 15);
const MAX_BATCH_RUNS = numberFromEnv("BENCH_MAX_BATCH_RUNS", 8192);
const RNG_BASE_SEED = 0x5eed1234;
const REPORT_PATH = path.join(__dirname, "RESULTS.md");
const JSON_PATH = path.join(__dirname, "results.json");

let blackHole = 0;

function numberFromEnv(name, fallback) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function createRng(seed) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function consume(result) {
  if (typeof result === "number") {
    blackHole += Number.isFinite(result) ? result : 1;
    return;
  }
  if (Array.isArray(result)) {
    blackHole += result.length;
    return;
  }
  if (result && typeof result === "object" && "length" in result) {
    blackHole += Number(result.length) || 1;
    return;
  }
  blackHole += String(result).length;
}

function percentile(sortedValues, fraction) {
  if (sortedValues.length === 0) return 0;
  const index = (sortedValues.length - 1) * fraction;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sortedValues[lower];
  const weight = index - lower;
  return sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight;
}

function summarize(values) {
  const sorted = [...values].sort((a, b) => a - b);
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
    Math.max(1, values.length - 1);

  return {
    count: values.length,
    mean,
    median: percentile(sorted, 0.5),
    p95: percentile(sorted, 0.95),
    stdDev: Math.sqrt(variance),
    min: sorted[0],
    max: sorted[sorted.length - 1],
  };
}

function runBatch(workload, batchRuns) {
  let result;
  for (let i = 0; i < batchRuns; i++) result = workload();
  consume(result);
}

function timeBatch(workload, batchRuns) {
  const t0 = performance.now();
  runBatch(workload, batchRuns);
  return performance.now() - t0;
}

function calibrateBatch(workload) {
  let batchRuns = 1;
  while (batchRuns < MAX_BATCH_RUNS) {
    const elapsedMs = timeBatch(workload, batchRuns);
    if (elapsedMs >= TARGET_SAMPLE_MS) return batchRuns;
    batchRuns *= 2;
  }
  return MAX_BATCH_RUNS;
}

function bench(workload, unitsPerWorkload) {
  for (let i = 0; i < WARMUP_RUNS; i++) runBatch(workload, 1);

  const batchRuns = calibrateBatch(workload);
  const sampleMs = [];
  const heapDeltasBytes = [];

  for (let i = 0; i < MEASURE_RUNS; i++) {
    if (typeof global.gc === "function") global.gc();
    const heapBefore = process.memoryUsage().heapUsed;
    const elapsedMs = timeBatch(workload, batchRuns);
    const heapAfter = process.memoryUsage().heapUsed;

    sampleMs.push(elapsedMs / batchRuns);
    heapDeltasBytes.push(Math.max(0, heapAfter - heapBefore) / batchRuns);
  }

  const timing = summarize(sampleMs);
  const memory = summarize(heapDeltasBytes);

  return {
    batchRuns,
    unitsPerWorkload,
    timing,
    memory,
    unitsPerSecond: unitsPerWorkload / (timing.median / 1000),
    samples: {
      msPerWorkload: sampleMs,
      heapDeltaBytesPerWorkload: heapDeltasBytes,
    },
  };
}

function formatNumber(value) {
  if (!Number.isFinite(value)) return String(value);
  if (Math.abs(value) >= 1000) return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (Math.abs(value) >= 10) return value.toFixed(2);
  if (Math.abs(value) >= 1) return value.toFixed(4);
  return value.toExponential(3);
}

function formatMs(value) {
  return `${formatNumber(value)} ms`;
}

function formatOps(value) {
  return `${formatNumber(value)} units/s`;
}

function formatBytes(value) {
  return `${formatNumber(value / 1024)} KB`;
}

function markdownTable(headers, rows) {
  const line = (cells) => `| ${cells.join(" | ")} |`;
  return [
    line(headers),
    line(headers.map(() => "---")),
    ...rows.map(line),
  ].join("\n");
}

function randomValues(size, seed) {
  const rng = createRng(seed);
  return Array.from({ length: size }, () => rng() * 2000 - 1000);
}

function buildMatrix(size) {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) =>
      row === col ? size * 4 + 1 : row + col + 1
    )
  );
}

const arithmeticInput = randomValues(2000, RNG_BASE_SEED ^ 1);
const formattingInput = randomValues(600, RNG_BASE_SEED ^ 2).map((v) => Math.abs(v) * 100000);
const statisticsInput = randomValues(2000, RNG_BASE_SEED ^ 3);
const matrixA = buildMatrix(8);
const matrixB = Matrix.transpose(matrixA);
const matrixSolveA = buildMatrix(4);
const matrixSolveB = [1, 2, 3, 4];
const ndarrayA = NDArray.linspace(0, 1, 2048);
const ndarrayB = NDArray.linspace(1, 2, 2048);
const fftSignal = Array.from({ length: 512 }, (_, i) =>
  Math.sin((2 * Math.PI * 16 * i) / 512) + 0.5 * Math.cos((2 * Math.PI * 48 * i) / 512)
);
const precisionOneCent = new BigPrecision("0.01");

const workloads = [
  {
    category: "arithmetic",
    name: "validated floating-point reduction",
    units: arithmeticInput.length,
    run() {
      let total = 0;
      for (const value of arithmeticInput) total = Arithmetic.add(total, value);
      return total;
    },
  },
  {
    category: "formatting",
    name: "commas, abbreviations, and currency formatting",
    units: formattingInput.length,
    run() {
      let totalLength = 0;
      for (const value of formattingInput) {
        totalLength += Formatting.addCommas(value).length;
        totalLength += Formatting.abbreviate(value).length;
        totalLength += Currency.format(value, "USD", "en-US").length;
      }
      return totalLength;
    },
  },
  {
    category: "statistics",
    name: "mean, standard deviation, quartiles, skewness",
    units: statisticsInput.length,
    run() {
      return (
        Statistics.mean(statisticsInput) +
        Statistics.stdDev(statisticsInput) +
        Statistics.quartiles(statisticsInput).Q2 +
        Statistics.skewness(statisticsInput)
      );
    },
  },
  {
    category: "matrix",
    name: "8x8 multiply plus 4x4 solve",
    units: 8 * 8 * 8,
    run() {
      const product = Matrix.multiply(matrixA, matrixB);
      const solution = Matrix.solve(matrixSolveA, matrixSolveB);
      return product[0][0] + solution[0][0];
    },
  },
  {
    category: "ndarray",
    name: "vector add, multiply, and sum",
    units: ndarrayA.size,
    run() {
      return ndarrayA.add(ndarrayB).multiply(3).sum();
    },
  },
  {
    category: "linalg",
    name: "solve, inverse, and eigenvalues on small dense matrices",
    units: 4 * 4,
    run() {
      const solved = LinAlg.solve(matrixSolveA, matrixSolveB).toArray()[0];
      const inv = LinAlg.inv(matrixSolveA).toArray()[0];
      const eig = LinAlg.eig([
        [2, 1],
        [1, 2],
      ]).values.toArray()[0];
      return solved + inv + eig;
    },
  },
  {
    category: "fft",
    name: "512-sample real FFT and magnitude spectrum",
    units: fftSignal.length,
    run() {
      return FFT.magnitude(FFT.rfft(fftSignal))[16];
    },
  },
  {
    category: "calculus",
    name: "Simpson integration and finite-difference derivative",
    units: 1000,
    run() {
      return (
        Calculus.integrate((x) => Math.sin(x), 0, Math.PI, "simpson", 1000) +
        Calculus.differentiate((x) => x ** 3, 2)
      );
    },
  },
  {
    category: "precision",
    name: "BigPrecision decimal accumulation",
    units: 200,
    run() {
      let total = new BigPrecision("0");
      for (let i = 0; i < 200; i++) total = total.add(precisionOneCent);
      return total.toNumber();
    },
  },
  {
    category: "chain",
    name: "chain API arithmetic and rounding",
    units: 1000,
    run() {
      let total = 0;
      for (let i = 1; i <= 1000; i++) {
        total += numwiz(i).add(5).multiply(1.2).divide(3).round(4).val();
      }
      return total;
    },
  },
];

function runAccuracySnapshot() {
  const decimalIterations = 1000;
  let native = 0;
  let precise = new BigPrecision("0");
  for (let i = 0; i < decimalIterations; i++) {
    native += 0.1;
    precise = precise.add("0.1");
  }

  return {
    decimalAccumulation: {
      iterations: decimalIterations,
      expected: "100",
      native: native.toPrecision(17),
      bigPrecision: precise.toString(),
      nativeAbsError: Math.abs(native - 100),
      bigPrecisionAbsError: new BigPrecision(precise).sub("100").abs().toString(),
    },
    fftRoundTripMaxError: Math.max(
      ...FFT.ifft(FFT.fft([1, 0, -1, 0])).map((value, index) =>
        Math.abs(value.real - [1, 0, -1, 0][index])
      )
    ),
    calculusIntegralError: Math.abs(
      Calculus.integrate((x) => x * x, 0, 3) - 9
    ),
  };
}

function buildReport(payload) {
  const table = markdownTable(
    [
      "Category",
      "Workload",
      "Units/run",
      "Median",
      "p95",
      "Throughput",
      "Heap/run",
      "Batch",
    ],
    payload.results.map((row) => [
      row.category,
      row.name,
      row.unitsPerWorkload.toLocaleString(),
      formatMs(row.timing.median),
      formatMs(row.timing.p95),
      formatOps(row.unitsPerSecond),
      formatBytes(row.memory.median),
      String(row.batchRuns),
    ])
  );

  const accuracy = payload.accuracy;

  return [
    "# NumWiz Benchmark Report",
    "",
    `Generated: ${payload.env.generatedAt}`,
    "",
    "## Methodology",
    "",
    "- Run with `npm run bench`, which builds TypeScript and executes this benchmark with explicit GC enabled when available.",
    "- Inputs are deterministic and generated from fixed seeds.",
    "- Each workload is warmed up, calibrated into batches, and measured over multiple samples.",
    "- Tables report medians and p95 timing. Raw samples are written to `benchmark/results.json`.",
    "- Memory uses `process.memoryUsage().heapUsed` deltas after GC when available; treat this as a comparative signal.",
    "",
    "## Environment",
    "",
    `- Package: ${payload.env.packageName}@${payload.env.packageVersion}`,
    `- Node.js: ${payload.env.node}`,
    `- Platform: ${payload.env.platform}`,
    `- CPU: ${payload.env.cpu}`,
    `- Logical cores: ${payload.env.logicalCores}`,
    `- RAM (GB): ${payload.env.totalMemoryGb}`,
    `- Explicit GC available: ${payload.env.gcExposed ? "yes" : "no"}`,
    "",
    "## Results",
    "",
    table,
    "",
    "## Accuracy Snapshot",
    "",
    `- Decimal accumulation expected ${accuracy.decimalAccumulation.expected}; native result ${accuracy.decimalAccumulation.native}; BigPrecision result ${accuracy.decimalAccumulation.bigPrecision}.`,
    `- Native decimal absolute error: ${accuracy.decimalAccumulation.nativeAbsError}.`,
    `- BigPrecision decimal absolute error: ${accuracy.decimalAccumulation.bigPrecisionAbsError}.`,
    `- FFT round-trip max error: ${accuracy.fftRoundTripMaxError}.`,
    `- Calculus integral absolute error for integral of x^2 from 0 to 3: ${accuracy.calculusIntegralError}.`,
    "",
    "## Notes",
    "",
    "- Native JavaScript remains the right tool for raw scalar throughput.",
    "- NumWiz adds validation, module breadth, chain ergonomics, and decimal precision where those tradeoffs matter.",
    "- BigPrecision is intentionally slower than `number` arithmetic but avoids IEEE-754 decimal accumulation errors.",
  ].join("\n");
}

function run() {
  const env = {
    generatedAt: new Date().toISOString(),
    packageName: packageJson.name,
    packageVersion: packageJson.version,
    node: process.version,
    platform: `${process.platform} ${process.arch}`,
    cpu: os.cpus()[0] ? os.cpus()[0].model.trim() : "Unknown",
    logicalCores: os.cpus().length,
    totalMemoryGb: Number((os.totalmem() / 1024 ** 3).toFixed(2)),
    warmupRuns: WARMUP_RUNS,
    measuredRuns: MEASURE_RUNS,
    targetSampleMs: TARGET_SAMPLE_MS,
    maxBatchRuns: MAX_BATCH_RUNS,
    deterministicSeed: RNG_BASE_SEED,
    gcExposed: typeof global.gc === "function",
  };

  const results = workloads.map((workload) => ({
    category: workload.category,
    name: workload.name,
    ...bench(workload.run, workload.units),
  }));
  const accuracy = runAccuracySnapshot();
  const payload = { env, results, accuracy };

  fs.writeFileSync(JSON_PATH, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(REPORT_PATH, `${buildReport(payload)}\n`, "utf8");

  if (blackHole === Number.MIN_VALUE) console.log(blackHole);
  console.log(`Benchmark report written to: ${REPORT_PATH}`);
  console.log(`Raw benchmark data written to: ${JSON_PATH}`);
}

run();
