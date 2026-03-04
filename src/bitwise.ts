/**
 * Bitwise Operations
 */
class Bitwise {
  static and(a: number, b: number): number {
    Bitwise._validateInt(a);
    Bitwise._validateInt(b);
    return a & b;
  }

  static or(a: number, b: number): number {
    Bitwise._validateInt(a);
    Bitwise._validateInt(b);
    return a | b;
  }

  static xor(a: number, b: number): number {
    Bitwise._validateInt(a);
    Bitwise._validateInt(b);
    return a ^ b;
  }

  static not(a: number): number {
    Bitwise._validateInt(a);
    return ~a;
  }

  static leftShift(a: number, bits: number): number {
    Bitwise._validateInt(a);
    return a << bits;
  }

  static rightShift(a: number, bits: number): number {
    Bitwise._validateInt(a);
    return a >> bits;
  }

  static unsignedRightShift(a: number, bits: number): number {
    Bitwise._validateInt(a);
    return a >>> bits;
  }

  static getBit(num: number, position: number): 0 | 1 {
    Bitwise._validateInt(num);
    return ((num >> position) & 1) as 0 | 1;
  }

  static setBit(num: number, position: number): number {
    Bitwise._validateInt(num);
    return num | (1 << position);
  }

  static clearBit(num: number, position: number): number {
    Bitwise._validateInt(num);
    return num & ~(1 << position);
  }

  static toggleBit(num: number, position: number): number {
    Bitwise._validateInt(num);
    return num ^ (1 << position);
  }

  static countBits(num: number): number {
    let n = num < 0 ? num >>> 0 : num;
    let count = 0;
    while (n) {
      count += n & 1;
      n >>>= 1;
    }
    return count;
  }

  static isPowerOfTwo(n: number): boolean {
    return n > 0 && (n & (n - 1)) === 0;
  }

  static nearestPowerOfTwo(n: number): number {
    if (n <= 0) return 1;
    const lower = Math.pow(2, Math.floor(Math.log2(n)));
    const upper = lower * 2;
    return n - lower <= upper - n ? lower : upper;
  }

  static nextPowerOfTwo(n: number): number {
    if (n <= 0) return 1;
    if (Bitwise.isPowerOfTwo(n)) return n;
    return Math.pow(2, Math.ceil(Math.log2(n)));
  }

  static xorSwap(a: number, b: number): [number, number] {
    a = a ^ b;
    b = a ^ b;
    a = a ^ b;
    return [a, b];
  }

  static isBitSet(num: number, position: number): boolean {
    return ((num >> position) & 1) === 1;
  }

  static toBinaryString(num: number, bits = 32): string {
    return (num >>> 0).toString(2).padStart(bits, "0");
  }

  private static _validateInt(n: unknown): void {
    if (typeof n !== "number" || !Number.isFinite(n)) {
      throw new TypeError(`Expected a finite number, got ${typeof n}: ${n}`);
    }
  }
}

export default Bitwise;
