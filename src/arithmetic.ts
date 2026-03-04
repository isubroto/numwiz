/**
 * Arithmetic Operations
 */
class Arithmetic {
  static add(...nums: number[]): number {
    Arithmetic._validateNums(nums);
    return nums.reduce((sum, n) => sum + n, 0);
  }

  static subtract(...nums: number[]): number {
    Arithmetic._validateNums(nums);
    if (nums.length === 0) return 0;
    if (nums.length === 1) return nums[0];
    return nums.slice(1).reduce((diff, n) => diff - n, nums[0]);
  }

  static multiply(...nums: number[]): number {
    Arithmetic._validateNums(nums);
    return nums.reduce((product, n) => product * n, 1);
  }

  static divide(a: number, b: number): number {
    Arithmetic._validateNum(a);
    Arithmetic._validateNum(b);
    if (b === 0) throw new Error("Division by zero");
    return a / b;
  }

  static modulus(a: number, b: number): number {
    Arithmetic._validateNum(a);
    Arithmetic._validateNum(b);
    if (b === 0) throw new Error("Division by zero");
    return a % b;
  }

  static floorDivide(a: number, b: number): number {
    Arithmetic._validateNum(a);
    Arithmetic._validateNum(b);
    if (b === 0) throw new Error("Division by zero");
    return Math.floor(a / b);
  }

  static power(base: number, exponent: number): number {
    Arithmetic._validateNum(base);
    Arithmetic._validateNum(exponent);
    return Math.pow(base, exponent);
  }

  static sqrt(n: number): number {
    Arithmetic._validateNum(n);
    if (n < 0)
      throw new RangeError("Cannot take square root of negative number");
    return Math.sqrt(n);
  }

  static cbrt(n: number): number {
    Arithmetic._validateNum(n);
    return Math.cbrt(n);
  }

  static nthRoot(n: number, root: number): number {
    Arithmetic._validateNum(n);
    Arithmetic._validateNum(root);
    if (root === 0) throw new Error("Zeroth root is undefined");
    return Math.pow(n, 1 / root);
  }

  static abs(n: number): number {
    Arithmetic._validateNum(n);
    return Math.abs(n);
  }

  static negate(n: number): number {
    Arithmetic._validateNum(n);
    return -n;
  }

  static reciprocal(n: number): number {
    Arithmetic._validateNum(n);
    if (n === 0) throw new Error("Reciprocal of zero is undefined");
    return 1 / n;
  }

  static log(n: number): number {
    Arithmetic._validateNum(n);
    if (n <= 0) throw new RangeError("log requires positive number");
    return Math.log(n);
  }

  static log2(n: number): number {
    Arithmetic._validateNum(n);
    if (n <= 0) throw new RangeError("log2 requires positive number");
    return Math.log2(n);
  }

  static log10(n: number): number {
    Arithmetic._validateNum(n);
    if (n <= 0) throw new RangeError("log10 requires positive number");
    return Math.log10(n);
  }

  static exp(n: number): number {
    Arithmetic._validateNum(n);
    return Math.exp(n);
  }

  // =====================
  // Input Validation
  // =====================

  private static _validateNum(n: unknown): void {
    if (typeof n !== "number" || Number.isNaN(n)) {
      throw new TypeError(`Expected a number, got ${typeof n}: ${n}`);
    }
  }

  private static _validateNums(nums: unknown[]): void {
    if (nums.length === 0) return;
    nums.forEach((n, i) => {
      if (typeof n !== "number" || Number.isNaN(n as number)) {
        throw new TypeError(
          `Argument at index ${i} is not a valid number: ${n}`
        );
      }
    });
  }
}

export default Arithmetic;
