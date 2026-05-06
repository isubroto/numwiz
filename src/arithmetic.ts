/**
 * Arithmetic Operations
 */
import { numwizError } from "./errors";

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
    if (b === 0) {
      throw numwizError(
        Error,
        "Arithmetic",
        "divide",
        "division by zero",
        "a finite, non-zero denominator",
        b
      );
    }
    return a / b;
  }

  static modulus(a: number, b: number): number {
    Arithmetic._validateNum(a);
    Arithmetic._validateNum(b);
    if (b === 0) {
      throw numwizError(
        Error,
        "Arithmetic",
        "modulus",
        "modulus by zero",
        "a finite, non-zero divisor",
        b
      );
    }
    return a % b;
  }

  static floorDivide(a: number, b: number): number {
    Arithmetic._validateNum(a);
    Arithmetic._validateNum(b);
    if (b === 0) {
      throw numwizError(
        Error,
        "Arithmetic",
        "floorDivide",
        "division by zero",
        "a finite, non-zero denominator",
        b
      );
    }
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
      throw numwizError(
        RangeError,
        "Arithmetic",
        "sqrt",
        "cannot take square root of a negative number",
        "a non-negative number",
        n
      );
    return Math.sqrt(n);
  }

  static cbrt(n: number): number {
    Arithmetic._validateNum(n);
    return Math.cbrt(n);
  }

  static nthRoot(n: number, root: number): number {
    Arithmetic._validateNum(n);
    Arithmetic._validateNum(root);
    if (root === 0) {
      throw numwizError(
        Error,
        "Arithmetic",
        "nthRoot",
        "zeroth root is undefined",
        "a non-zero root",
        root
      );
    }
    if (n < 0 && Number.isInteger(root) && Math.abs(root % 2) === 1) {
      return -Math.pow(-n, 1 / root);
    }
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
    if (n === 0) {
      throw numwizError(
        Error,
        "Arithmetic",
        "reciprocal",
        "reciprocal of zero is undefined",
        "a finite, non-zero number",
        n
      );
    }
    return 1 / n;
  }

  static log(n: number): number {
    Arithmetic._validateNum(n);
    if (n <= 0) {
      throw numwizError(
        RangeError,
        "Arithmetic",
        "log",
        "logarithm domain error",
        "a positive number",
        n
      );
    }
    return Math.log(n);
  }

  static log2(n: number): number {
    Arithmetic._validateNum(n);
    if (n <= 0) {
      throw numwizError(
        RangeError,
        "Arithmetic",
        "log2",
        "logarithm domain error",
        "a positive number",
        n
      );
    }
    return Math.log2(n);
  }

  static log10(n: number): number {
    Arithmetic._validateNum(n);
    if (n <= 0) {
      throw numwizError(
        RangeError,
        "Arithmetic",
        "log10",
        "logarithm domain error",
        "a positive number",
        n
      );
    }
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
      throw numwizError(
        TypeError,
        "Arithmetic",
        "validateNumber",
        "invalid numeric argument",
        "a JavaScript number that is not NaN",
        n
      );
    }
  }

  private static _validateNums(nums: unknown[]): void {
    if (nums.length === 0) return;
    nums.forEach((n, i) => {
      if (typeof n !== "number" || Number.isNaN(n as number)) {
        throw numwizError(
          TypeError,
          "Arithmetic",
          "validateNumbers",
          `invalid numeric argument at index ${i}`,
          "a JavaScript number that is not NaN",
          n
        );
      }
    });
  }
}

export default Arithmetic;
