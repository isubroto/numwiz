import Validation from "./validation";

/**
 * Advanced Math Operations
 */
class Advanced {
  static factorial(n: number): number {
    if (n < 0)
      throw new RangeError("Factorial of negative number is undefined");
    if (!Number.isInteger(n))
      throw new TypeError("Factorial requires an integer");
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  static permutation(n: number, r: number): number {
    if (r > n) throw new RangeError("r cannot be greater than n");
    return Advanced.factorial(n) / Advanced.factorial(n - r);
  }

  static combination(n: number, r: number): number {
    if (r > n) throw new RangeError("r cannot be greater than n");
    return (
      Advanced.factorial(n) /
      (Advanced.factorial(r) * Advanced.factorial(n - r))
    );
  }

  static gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) {
      [a, b] = [b, a % b];
    }
    return a;
  }

  static lcm(a: number, b: number): number {
    if (a === 0 && b === 0) return 0;
    return Math.abs(a * b) / Advanced.gcd(a, b);
  }

  static gcdArray(arr: number[]): number {
    if (arr.length === 0) throw new Error("Array is empty");
    return arr.reduce((a, b) => Advanced.gcd(a, b));
  }

  static lcmArray(arr: number[]): number {
    if (arr.length === 0) throw new Error("Array is empty");
    return arr.reduce((a, b) => Advanced.lcm(a, b));
  }

  static fibonacci(n: number): number {
    if (n < 0) throw new RangeError("Negative index not supported");
    if (n <= 1) return n;
    let a = 0,
      b = 1;
    for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
    return b;
  }

  static fibonacciSequence(n: number): number[] {
    if (n <= 0) return [];
    if (n === 1) return [0];
    const seq = [0, 1];
    for (let i = 2; i < n; i++) seq.push(seq[i - 1] + seq[i - 2]);
    return seq;
  }

  static primeFactors(n: number): number[] {
    if (n < 2) return [];
    const factors: number[] = [];
    let d = 2;
    while (n > 1) {
      while (n % d === 0) {
        factors.push(d);
        n /= d;
      }
      d++;
    }
    return factors;
  }

  static divisors(n: number): number[] {
    if (n <= 0) throw new RangeError("divisors requires a positive integer");
    const result: number[] = [];
    for (let i = 1; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        result.push(i);
        if (i !== n / i) result.push(n / i);
      }
    }
    return result.sort((a, b) => a - b);
  }

  static nextPrime(n: number): number {
    let p = n < 2 ? 2 : n + 1;
    while (!Validation.isPrime(p)) p++;
    return p;
  }

  static primesInRange(min: number, max: number): number[] {
    const primes: number[] = [];
    for (let i = Math.max(2, min); i <= max; i++) {
      if (Validation.isPrime(i)) primes.push(i);
    }
    return primes;
  }

  static digitSum(n: number): number {
    return Math.abs(n)
      .toString()
      .replace(".", "")
      .split("")
      .reduce((s, d) => s + Number(d), 0);
  }

  static digitalRoot(n: number): number {
    if (n === 0) return 0;
    return 1 + ((Math.abs(n) - 1) % 9);
  }

  static reverseNumber(n: number): number {
    const reversed = parseInt(
      Math.abs(n).toString().split("").reverse().join(""),
      10
    );
    return n < 0 ? -reversed : reversed;
  }

  static countDigits(n: number): number {
    return Math.abs(n).toString().replace(".", "").length;
  }

  static isPalindrome(n: number): boolean {
    const str = Math.abs(n).toString();
    return str === str.split("").reverse().join("");
  }

  static collatz(n: number): number[] {
    if (n <= 0 || !Number.isInteger(n))
      throw new RangeError("Collatz requires positive integer");
    const seq = [n];
    while (n !== 1) {
      n = n % 2 === 0 ? n / 2 : 3 * n + 1;
      seq.push(n);
    }
    return seq;
  }

  static pascal(row: number): number[] {
    if (row < 0) throw new RangeError("Row must be non-negative");
    const result = [1];
    for (let i = 1; i <= row; i++) {
      result.push((result[i - 1] * (row - i + 1)) / i);
    }
    return result;
  }

  static catalan(n: number): number {
    return Advanced.combination(2 * n, n) / (n + 1);
  }

  static eulerTotient(n: number): number {
    if (n <= 0)
      throw new RangeError("eulerTotient requires a positive integer");

    let result = n;
    let m = n;

    for (let p = 2; p * p <= m; p++) {
      if (m % p === 0) {
        while (m % p === 0) {
          m /= p;
        }
        result -= result / p;
      }
    }

    if (m > 1) {
      result -= result / m;
    }

    return Math.round(result);
  }

  static lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  static inverseLerp(start: number, end: number, value: number): number {
    if (start === end) throw new Error("start and end cannot be equal");
    return (value - start) / (end - start);
  }

  static map(
    value: number,
    inMin: number,
    inMax: number,
    outMin: number,
    outMax: number
  ): number {
    return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  static percentageOf(percent: number, num: number): number {
    return (percent / 100) * num;
  }

  static whatPercent(part: number, total: number): number {
    if (total === 0) throw new Error("Total cannot be zero");
    return (part / total) * 100;
  }

  static percentChange(oldVal: number, newVal: number): number {
    if (oldVal === 0) throw new Error("Old value cannot be zero");
    return ((newVal - oldVal) / Math.abs(oldVal)) * 100;
  }

  static sumOfDivisors(n: number): number {
    return Advanced.divisors(n).reduce((a, b) => a + b, 0);
  }
}

export default Advanced;
