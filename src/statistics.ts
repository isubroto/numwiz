import { numwizError } from "./errors";

export interface Quartiles {
  Q1: number;
  Q2: number;
  Q3: number;
}

class Statistics {
  static sum(arr: number[]): number {
    Statistics._validateArray(arr, "sum", 0);
    return arr.reduce((a, b) => a + b, 0);
  }
  static mean(arr: number[]): number {
    Statistics._validateArray(arr, "mean", 1);
    return Statistics.sum(arr) / arr.length;
  }

  static median(arr: number[]): number {
    Statistics._validateArray(arr, "median", 1);
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  static mode(arr: number[]): number[] {
    Statistics._validateArray(arr, "mode", 1);
    const freq: Record<string, number> = {};
    arr.forEach((n) => (freq[n] = (freq[n] || 0) + 1));
    const maxFreq = Math.max(...Object.values(freq));
    return Object.keys(freq)
      .filter((k) => freq[k] === maxFreq)
      .map(Number);
  }

  static min(arr: number[]): number {
    Statistics._validateArray(arr, "min", 1);
    return Math.min(...arr);
  }
  static max(arr: number[]): number {
    Statistics._validateArray(arr, "max", 1);
    return Math.max(...arr);
  }
  static range(arr: number[]): number {
    Statistics._validateArray(arr, "range", 1);
    return Statistics.max(arr) - Statistics.min(arr);
  }

  static variance(arr: number[]): number {
    Statistics._validateArray(arr, "variance", 1);
    const avg = Statistics.mean(arr);
    return arr.reduce((s, n) => s + Math.pow(n - avg, 2), 0) / arr.length;
  }

  static stdDev(arr: number[]): number {
    return Math.sqrt(Statistics.variance(arr));
  }

  static sampleVariance(arr: number[]): number {
    Statistics._validateArray(arr, "sampleVariance", 0);
    if (arr.length < 2) {
      throw numwizError(
        RangeError,
        "Statistics",
        "sampleVariance",
        "not enough data points",
        "at least 2 finite numbers",
        arr
      );
    }
    const avg = Statistics.mean(arr);
    return arr.reduce((s, n) => s + Math.pow(n - avg, 2), 0) / (arr.length - 1);
  }

  static sampleStdDev(arr: number[]): number {
    return Math.sqrt(Statistics.sampleVariance(arr));
  }

  static percentile(arr: number[], p: number): number {
    Statistics._validateArray(arr, "percentile", 1);
    if (!Number.isFinite(p) || p < 0 || p > 100) {
      throw numwizError(
        RangeError,
        "Statistics",
        "percentile",
        "invalid percentile",
        "a finite number between 0 and 100",
        p
      );
    }
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = (p / 100) * (sorted.length - 1);
    const lo = Math.floor(idx),
      hi = Math.ceil(idx);
    return lo === hi
      ? sorted[lo]
      : sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
  }

  static quartiles(arr: number[]): Quartiles {
    return {
      Q1: Statistics.percentile(arr, 25),
      Q2: Statistics.percentile(arr, 50),
      Q3: Statistics.percentile(arr, 75),
    };
  }

  static iqr(arr: number[]): number {
    const q = Statistics.quartiles(arr);
    return q.Q3 - q.Q1;
  }

  static geometricMean(arr: number[]): number {
    Statistics._validateArray(arr, "geometricMean", 1);
    const product = arr.reduce((a, b) => a * b, 1);
    return Math.pow(product, 1 / arr.length);
  }

  static harmonicMean(arr: number[]): number {
    Statistics._validateArray(arr, "harmonicMean", 1);
    if (arr.some((n) => n === 0)) {
      throw numwizError(
        RangeError,
        "Statistics",
        "harmonicMean",
        "zero value makes harmonic mean undefined",
        "finite, non-zero numbers",
        arr
      );
    }
    const recipSum = arr.reduce((s, n) => s + 1 / n, 0);
    return arr.length / recipSum;
  }

  static weightedMean(values: number[], weights: number[]): number {
    Statistics._validateArray(values, "weightedMean", 1);
    Statistics._validateArray(weights, "weightedMean", 1);
    if (values.length !== weights.length) {
      throw numwizError(
        RangeError,
        "Statistics",
        "weightedMean",
        "values and weights length mismatch",
        "arrays with equal length",
        { valuesLength: values.length, weightsLength: weights.length }
      );
    }
    const sum = values.reduce((s, v, i) => s + v * weights[i], 0);
    const wSum = weights.reduce((a, b) => a + b, 0);
    if (wSum === 0) {
      throw numwizError(
        RangeError,
        "Statistics",
        "weightedMean",
        "weights sum to zero",
        "weights with a non-zero sum",
        weights
      );
    }
    return sum / wSum;
  }

  static zScore(value: number, arr: number[]): number {
    if (!Number.isFinite(value)) {
      throw numwizError(
        TypeError,
        "Statistics",
        "zScore",
        "invalid value",
        "a finite number",
        value
      );
    }
    const sd = Statistics.stdDev(arr);
    if (sd === 0)
      throw numwizError(
        Error,
        "Statistics",
        "zScore",
        "standard deviation is zero",
        "an array with non-zero variation",
        arr
      );
    return (value - Statistics.mean(arr)) / sd;
  }

  static correlation(x: number[], y: number[]): number {
    Statistics._validateArray(x, "correlation", 0);
    Statistics._validateArray(y, "correlation", 0);
    if (x.length !== y.length) {
      throw numwizError(
        RangeError,
        "Statistics",
        "correlation",
        "arrays must have equal length",
        "x and y arrays with the same length",
        { xLength: x.length, yLength: y.length }
      );
    }
    if (x.length < 2)
      throw numwizError(
        RangeError,
        "Statistics",
        "correlation",
        "not enough data points",
        "at least 2 finite numbers in each array",
        { xLength: x.length, yLength: y.length }
      );
    const n = x.length;
    const xMean = Statistics.mean(x),
      yMean = Statistics.mean(y);
    let num = 0,
      denX = 0,
      denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - xMean,
        dy = y[i] - yMean;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    const denom = Math.sqrt(denX * denY);
    if (denom === 0) return 0;
    return num / denom;
  }

  static frequency(arr: number[]): Record<number, number> {
    Statistics._validateArray(arr, "frequency", 0);
    return arr.reduce((f: Record<number, number>, n) => {
      f[n] = (f[n] || 0) + 1;
      return f;
    }, {});
  }

  static skewness(arr: number[]): number {
    Statistics._validateArray(arr, "skewness", 0);
    if (arr.length < 3)
      throw numwizError(
        RangeError,
        "Statistics",
        "skewness",
        "not enough data points",
        "at least 3 finite numbers",
        arr
      );
    const n = arr.length,
      avg = Statistics.mean(arr),
      sd = Statistics.stdDev(arr);
    if (sd === 0) return 0;
    const sum = arr.reduce((s, v) => s + Math.pow((v - avg) / sd, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  }

  private static _validateArray(
    arr: number[],
    method: string,
    minLength: number
  ): void {
    if (!Array.isArray(arr)) {
      throw numwizError(
        TypeError,
        "Statistics",
        method,
        "invalid data input",
        "an array of finite numbers",
        arr
      );
    }
    if (arr.length < minLength) {
      throw numwizError(
        RangeError,
        "Statistics",
        method,
        "not enough data points",
        `at least ${minLength} finite number${minLength === 1 ? "" : "s"}`,
        arr
      );
    }
    arr.forEach((value, index) => {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw numwizError(
          TypeError,
          "Statistics",
          method,
          `invalid number at index ${index}`,
          "finite JavaScript numbers",
          value
        );
      }
    });
  }
}

export default Statistics;
