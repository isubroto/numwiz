class Comparison {
  static isEqual(a: unknown, b: unknown): boolean {
    return a === b;
  }
  static isAlmostEqual(a: number, b: number, epsilon = 1e-10): boolean {
    return Math.abs(a - b) < epsilon;
  }
  static isGreaterThan(a: number, b: number): boolean {
    return a > b;
  }
  static isLessThan(a: number, b: number): boolean {
    return a < b;
  }
  static isGreaterThanOrEqual(a: number, b: number): boolean {
    return a >= b;
  }
  static isLessThanOrEqual(a: number, b: number): boolean {
    return a <= b;
  }
  static clamp(num: number, min: number, max: number): number {
    return Math.min(Math.max(num, min), max);
  }
  static sign(n: number): number {
    return Math.sign(n);
  }
  static max(...nums: number[]): number {
    return Math.max(...nums);
  }
  static min(...nums: number[]): number {
    return Math.min(...nums);
  }
}

export default Comparison;
