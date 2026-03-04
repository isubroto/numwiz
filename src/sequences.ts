import Validation from "./validation";

class Sequences {
  static arithmetic(start: number, diff: number, count: number): number[] {
    return Array.from({ length: count }, (_, i) => start + diff * i);
  }

  static geometric(start: number, ratio: number, count: number): number[] {
    return Array.from({ length: count }, (_, i) => start * Math.pow(ratio, i));
  }

  static fibonacci(count: number): number[] {
    if (count <= 0) return [];
    if (count === 1) return [0];
    const seq = [0, 1];
    for (let i = 2; i < count; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return seq;
  }

  static primes(count: number): number[] {
    const result: number[] = [];
    let n = 2;
    while (result.length < count) {
      if (Validation.isPrime(n)) result.push(n);
      n++;
    }
    return result;
  }

  static triangular(count: number): number[] {
    return Array.from({ length: count }, (_, i) => ((i + 1) * (i + 2)) / 2);
  }

  static square(count: number): number[] {
    return Array.from({ length: count }, (_, i) => (i + 1) * (i + 1));
  }

  static cube(count: number): number[] {
    return Array.from({ length: count }, (_, i) => Math.pow(i + 1, 3));
  }

  static custom(count: number, fn: (i: number) => number): number[] {
    return Array.from({ length: count }, (_, i) => fn(i));
  }

  static lucas(count: number): number[] {
    if (count <= 0) return [];
    if (count === 1) return [2];
    const seq = [2, 1];
    for (let i = 2; i < count; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return seq;
  }
}

export default Sequences;
