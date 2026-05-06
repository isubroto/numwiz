class Validation {
  static isNumber(v: unknown): v is number {
    return typeof v === "number" && !isNaN(v as number);
  }
  static isInteger(v: unknown): boolean {
    return Number.isInteger(v);
  }
  static isFloat(v: unknown): boolean {
    return Validation.isNumber(v) && !Number.isInteger(v);
  }
  static isFinite(v: unknown): boolean {
    return Number.isFinite(v as number);
  }
  static isNaN(v: unknown): boolean {
    return Number.isNaN(v as number);
  }
  static isPositive(v: unknown): boolean {
    return Validation.isNumber(v) && (v as number) > 0;
  }
  static isNegative(v: unknown): boolean {
    return Validation.isNumber(v) && (v as number) < 0;
  }
  static isZero(v: unknown): boolean {
    return v === 0;
  }
  static isEven(v: number): boolean {
    return v % 2 === 0;
  }
  static isOdd(v: number): boolean {
    return Math.abs(v) % 2 === 1;
  }
  static isSafeInteger(v: unknown): boolean {
    return Number.isSafeInteger(v);
  }
  static isWholeNumber(v: unknown): boolean {
    return Number.isInteger(v) && (v as number) >= 0;
  }
  static isDivisibleBy(n: number, d: number): boolean {
    return d !== 0 && n % d === 0;
  }
  static isInRange(n: number, min: number, max: number): boolean {
    return n >= min && n <= max;
  }

  static isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2 || n === 3) return true;
    if (n % 2 === 0 || n % 3 === 0) return false;
    for (let i = 5; i * i <= n; i += 6) {
      if (n % i === 0 || n % (i + 2) === 0) return false;
    }
    return true;
  }

  static isPerfectSquare(n: number): boolean {
    return n >= 0 && Math.sqrt(n) % 1 === 0;
  }
  static isPerfectCube(n: number): boolean {
    const c = Math.round(Math.cbrt(n));
    return c * c * c === n;
  }
  static isPowerOfTwo(n: number): boolean {
    return n > 0 && Number.isSafeInteger(n) && Math.log2(n) % 1 === 0;
  }
  static isPowerOfN(num: number, n: number): boolean {
    if (num <= 0) return false;
    return Number.isInteger(Math.log(num) / Math.log(n));
  }

  static isPalindrome(n: number): boolean {
    const s = Math.abs(n).toString();
    return s === s.split("").reverse().join("");
  }

  static isArmstrong(n: number): boolean {
    const digits = n.toString().split("").map(Number);
    const power = digits.length;
    const sum = digits.reduce((s, d) => s + Math.pow(d, power), 0);
    return sum === n;
  }

  static isHarshad(n: number): boolean {
    const digitSum = Math.abs(n)
      .toString()
      .split("")
      .reduce((s, d) => s + Number(d), 0);
    return n % digitSum === 0;
  }

  static isPerfectNumber(n: number): boolean {
    if (n <= 1) return false;
    let sum = 1;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        sum += i;
        if (i !== n / i) sum += n / i;
      }
    }
    return sum === n;
  }

  static isAbundant(n: number): boolean {
    let sum = 1;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        sum += i;
        if (i !== n / i) sum += n / i;
      }
    }
    return sum > n;
  }

  static isDeficient(n: number): boolean {
    let sum = 1;
    for (let i = 2; i <= Math.sqrt(n); i++) {
      if (n % i === 0) {
        sum += i;
        if (i !== n / i) sum += n / i;
      }
    }
    return sum < n;
  }
}

export default Validation;
