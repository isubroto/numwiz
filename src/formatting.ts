import NumberWords from "./number-words";

class Formatting {
  // ---- Rounding ----
  static toFixed(num: number, decimals = 2): number {
    return Number(num.toFixed(decimals));
  }
  static toPrecision(num: number, digits: number): number {
    return Number(num.toPrecision(digits));
  }
  static round(num: number): number {
    return Math.round(num);
  }
  static floor(num: number): number {
    return Math.floor(num);
  }
  static ceil(num: number): number {
    return Math.ceil(num);
  }
  static trunc(num: number): number {
    return Math.trunc(num);
  }

  static bankersRound(num: number, decimals = 0): number {
    const m = Math.pow(10, decimals);
    const n = num * m;
    const f = Math.floor(n);
    const diff = n - f;
    if (diff === 0.5) {
      return (f % 2 === 0 ? f : f + 1) / m;
    }
    return Math.round(n) / m;
  }

  // ---- Comma Formatting ----

  static addCommas(num: number): string {
    const [int, dec] = num.toString().split(".");
    const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return dec ? `${formatted}.${dec}` : formatted;
  }

  static addIndianCommas(num: number): string {
    const [int, dec] = num.toString().split(".");
    let lastThree = int.slice(-3);
    let remaining = int.slice(0, -3);
    if (remaining.length > 0) {
      remaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      lastThree = "," + lastThree;
    }
    const formatted = remaining + lastThree;
    return dec ? `${formatted}.${dec}` : formatted;
  }

  // ---- Percentage ----

  static toPercentage(num: number, decimals = 2): string {
    return `${num.toFixed(decimals)}%`;
  }

  static ratioToPercentage(num: number, decimals = 2): string {
    return `${(num * 100).toFixed(decimals)}%`;
  }

  static fromPercentage(str: string): number {
    return parseFloat(str) / 100;
  }

  static fromPercentageRaw(str: string): number {
    return parseFloat(str);
  }

  // ---- Padding ----
  static padStart(num: number, length: number, char = "0"): string {
    return String(num).padStart(length, char);
  }

  static padEnd(num: number, length: number, char = "0"): string {
    return String(num).padEnd(length, char);
  }

  // ---- Ordinal ----
  static toOrdinal(num: number, locale = "en"): string {
    const loc = NumberWords._getLocale(locale);
    return loc && loc.ordinals ? loc.ordinals(num) : `${num}`;
  }

  // ---- Number to Words ----
  static toWords(
    num: number,
    locale = "en",
    system: string | null = null
  ): string {
    return NumberWords.toWords(num, locale, system);
  }

  static toWordsIndian(num: number, locale = "en"): string {
    return NumberWords.toWords(num, locale, "indian");
  }

  static toWordsWestern(num: number, locale = "en"): string {
    return NumberWords.toWords(num, locale, "western");
  }

  // ---- Abbreviations ----

  static abbreviate(num: number, decimals = 1): string {
    const units = [
      { value: 1e18, symbol: "Qi" },
      { value: 1e15, symbol: "Qa" },
      { value: 1e12, symbol: "T" },
      { value: 1e9, symbol: "B" },
      { value: 1e6, symbol: "M" },
      { value: 1e3, symbol: "K" },
    ];
    const abs = Math.abs(num);
    for (const unit of units) {
      if (abs >= unit.value) {
        return `${(num / unit.value).toFixed(decimals).replace(/\.0$/, "")}${
          unit.symbol
        }`;
      }
    }
    return num.toString();
  }

  static abbreviateIndian(num: number, decimals = 1): string {
    const units = [
      { value: 1e13, symbol: "Neel" },
      { value: 1e11, symbol: "Kh" },
      { value: 1e9, symbol: "Ar" },
      { value: 1e7, symbol: "Cr" },
      { value: 1e5, symbol: "L" },
      { value: 1e3, symbol: "K" },
    ];
    const abs = Math.abs(num);
    for (const unit of units) {
      if (abs >= unit.value) {
        return `${(num / unit.value).toFixed(decimals).replace(/\.0$/, "")}${
          unit.symbol
        }`;
      }
    }
    return num.toString();
  }

  // ---- Scientific / Engineering Notation ----
  static toScientific(num: number, decimals = 2): string {
    return num.toExponential(decimals);
  }

  static toEngineering(num: number): string {
    const exp = Math.floor(Math.log10(Math.abs(num)));
    const engExp = Math.floor(exp / 3) * 3;
    const mantissa = num / Math.pow(10, engExp);
    return `${mantissa}×10^${engExp}`;
  }

  // ---- Fraction ----
  static toFraction(decimal: number, maxDenominator = 1000): string {
    if (Number.isInteger(decimal)) return `${decimal}/1`;

    let bestNumer = 1,
      bestDenom = 1,
      bestError = Math.abs(decimal - 1);

    for (let d = 1; d <= maxDenominator; d++) {
      const n = Math.round(decimal * d);
      const error = Math.abs(decimal - n / d);
      if (error < bestError) {
        bestError = error;
        bestNumer = n;
        bestDenom = d;
        if (error === 0) break;
      }
    }
    return `${bestNumer}/${bestDenom}`;
  }

  // ---- Roman Numerals ----
  static toRoman(num: number): string {
    if (num <= 0 || num > 3999) throw new Error("Roman numerals: 1-3999 only");
    const map: [number, string][] = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let result = "";
    for (const [value, symbol] of map) {
      while (num >= value) {
        result += symbol;
        num -= value;
      }
    }
    return result;
  }

  static fromRoman(str: string): number {
    const map: Record<string, number> = {
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000,
    };
    let result = 0;
    for (let i = 0; i < str.length; i++) {
      const curr = map[str[i]],
        next = map[str[i + 1]];
      result += next && curr < next ? -curr : curr;
    }
    return result;
  }
}

export default Formatting;
