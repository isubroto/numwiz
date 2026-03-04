export interface Quartiles {
  Q1: number;
  Q2: number;
  Q3: number;
}

class Statistics {
  static sum(arr: number[]): number {
    return arr.reduce((a, b) => a + b, 0);
  }
  static mean(arr: number[]): number {
    return Statistics.sum(arr) / arr.length;
  }

  static median(arr: number[]): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  }

  static mode(arr: number[]): number[] {
    const freq: Record<string, number> = {};
    arr.forEach((n) => (freq[n] = (freq[n] || 0) + 1));
    const maxFreq = Math.max(...Object.values(freq));
    return Object.keys(freq)
      .filter((k) => freq[k] === maxFreq)
      .map(Number);
  }

  static min(arr: number[]): number {
    return Math.min(...arr);
  }
  static max(arr: number[]): number {
    return Math.max(...arr);
  }
  static range(arr: number[]): number {
    return Statistics.max(arr) - Statistics.min(arr);
  }

  static variance(arr: number[]): number {
    const avg = Statistics.mean(arr);
    return arr.reduce((s, n) => s + Math.pow(n - avg, 2), 0) / arr.length;
  }

  static stdDev(arr: number[]): number {
    return Math.sqrt(Statistics.variance(arr));
  }

  static sampleVariance(arr: number[]): number {
    if (arr.length < 2) {
      throw new RangeError(
        `sampleVariance requires at least 2 data points, got ${arr.length}`
      );
    }
    const avg = Statistics.mean(arr);
    return arr.reduce((s, n) => s + Math.pow(n - avg, 2), 0) / (arr.length - 1);
  }

  static sampleStdDev(arr: number[]): number {
    return Math.sqrt(Statistics.sampleVariance(arr));
  }

  static percentile(arr: number[], p: number): number {
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
    const product = arr.reduce((a, b) => a * b, 1);
    return Math.pow(product, 1 / arr.length);
  }

  static harmonicMean(arr: number[]): number {
    const recipSum = arr.reduce((s, n) => s + 1 / n, 0);
    return arr.length / recipSum;
  }

  static weightedMean(values: number[], weights: number[]): number {
    const sum = values.reduce((s, v, i) => s + v * weights[i], 0);
    const wSum = weights.reduce((a, b) => a + b, 0);
    return sum / wSum;
  }

  static zScore(value: number, arr: number[]): number {
    const sd = Statistics.stdDev(arr);
    if (sd === 0)
      throw new Error("Cannot compute z-score: standard deviation is 0");
    return (value - Statistics.mean(arr)) / sd;
  }

  static correlation(x: number[], y: number[]): number {
    if (x.length !== y.length) throw new Error("Arrays must have equal length");
    if (x.length < 2)
      throw new RangeError("correlation requires at least 2 data points");
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
    return arr.reduce((f: Record<number, number>, n) => {
      f[n] = (f[n] || 0) + 1;
      return f;
    }, {});
  }

  static skewness(arr: number[]): number {
    if (arr.length < 3)
      throw new RangeError("skewness requires at least 3 data points");
    const n = arr.length,
      avg = Statistics.mean(arr),
      sd = Statistics.stdDev(arr);
    if (sd === 0) return 0;
    const sum = arr.reduce((s, v) => s + Math.pow((v - avg) / sd, 3), 0);
    return (n / ((n - 1) * (n - 2))) * sum;
  }
}

export default Statistics;
