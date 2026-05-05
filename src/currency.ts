import NumberWords from "./number-words";
import { numwizError } from "./errors";

class Currency {
  // ==========================================
  // WESTERN FORMAT: $1,234,567.89
  // ==========================================

  static format(amount: number, currency = "USD", locale = "en-US"): string {
    Currency._validateAmount(amount, "format");
    try {
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
      }).format(amount);
    } catch (error) {
      throw numwizError(
        error instanceof RangeError ? RangeError : Error,
        "Currency",
        "format",
        "invalid locale or currency code",
        "a valid BCP 47 locale and ISO 4217 currency code",
        { locale, currency }
      );
    }
  }

  // ==========================================
  // INDIAN FORMAT: ₹12,34,567.89
  // ==========================================

  static formatIndian(amount: number, symbol = "₹"): string {
    Currency._validateAmount(amount, "formatIndian");
    const isNeg = amount < 0;
    const num = Math.abs(amount);
    const [intPart, decPart] = num.toFixed(2).split(".");

    let lastThree = intPart.slice(-3);
    let remaining = intPart.slice(0, -3);

    if (remaining.length > 0) {
      remaining = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
      lastThree = "," + lastThree;
    }

    const formatted = remaining + lastThree + "." + decPart;
    return `${isNeg ? "-" : ""}${symbol}${formatted}`;
  }

  // ==========================================
  // ABBREVIATIONS
  // ==========================================

  static abbreviateWestern(amount: number, symbol = "$", decimals = 1): string {
    Currency._validateAmount(amount, "abbreviateWestern");
    const units = [
      { value: 1e15, label: "Q" },
      { value: 1e12, label: "T" },
      { value: 1e9, label: "B" },
      { value: 1e6, label: "M" },
      { value: 1e3, label: "K" },
    ];

    const abs = Math.abs(amount);
    for (const unit of units) {
      if (abs >= unit.value) {
        return `${amount < 0 ? "-" : ""}${symbol}${(abs / unit.value).toFixed(
          decimals
        )}${unit.label}`;
      }
    }
    return `${symbol}${amount.toFixed(2)}`;
  }

  static abbreviateIndian(amount: number, symbol = "₹", decimals = 1): string {
    Currency._validateAmount(amount, "abbreviateIndian");
    const units = [
      { value: 1e11, label: " Kharab" },
      { value: 1e9, label: " Arab" },
      { value: 1e7, label: " Cr" },
      { value: 1e5, label: " L" },
      { value: 1e3, label: " K" },
    ];

    const abs = Math.abs(amount);
    for (const unit of units) {
      if (abs >= unit.value) {
        return `${amount < 0 ? "-" : ""}${symbol}${(abs / unit.value).toFixed(
          decimals
        )}${unit.label}`;
      }
    }
    return `${symbol}${amount.toFixed(2)}`;
  }

  // ==========================================
  // CURRENCY TO WORDS
  // ==========================================

  static toWords(amount: number, currency = "USD", locale = "en"): string {
    Currency._validateAmount(amount, "toWords");
    return NumberWords.currencyToWords(amount, currency, locale, "western");
  }

  static toWordsIndian(
    amount: number,
    currency = "INR",
    locale = "en"
  ): string {
    Currency._validateAmount(amount, "toWordsIndian");
    return NumberWords.currencyToWords(amount, currency, locale, "indian");
  }

  static toWordsHindi(amount: number, currency = "INR"): string {
    Currency._validateAmount(amount, "toWordsHindi");
    return NumberWords.currencyToWords(amount, currency, "hi", "indian");
  }

  // ==========================================
  // CURRENCY INFO
  // ==========================================

  static getSymbol(code: string): string {
    const symbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      INR: "₹",
      JPY: "¥",
      CNY: "¥",
      AUD: "A$",
      CAD: "C$",
      CHF: "CHF",
      BDT: "৳",
      PKR: "₨",
      LKR: "Rs",
      NPR: "रू",
      AED: "د.إ",
      SAR: "﷼",
      BRL: "R$",
      RUB: "₽",
      KRW: "₩",
      MXN: "$",
      ZAR: "R",
      SGD: "S$",
      HKD: "HK$",
      SEK: "kr",
      NOK: "kr",
      DKK: "kr",
      TRY: "₺",
      THB: "฿",
      MYR: "RM",
      IDR: "Rp",
      PHP: "₱",
      VND: "₫",
      EGP: "E£",
      NGN: "₦",
      KES: "KSh",
      GHS: "GH₵",
    };
    return symbols[code] || code;
  }

  static convert(amount: number, fromRate: number, toRate: number): number {
    Currency._validateAmount(amount, "convert");
    if (!Number.isFinite(fromRate) || fromRate === 0) {
      throw numwizError(
        RangeError,
        "Currency",
        "convert",
        "invalid source exchange rate",
        "a finite, non-zero fromRate",
        fromRate
      );
    }
    if (!Number.isFinite(toRate)) {
      throw numwizError(
        RangeError,
        "Currency",
        "convert",
        "invalid target exchange rate",
        "a finite toRate",
        toRate
      );
    }
    return (amount / fromRate) * toRate;
  }

  private static _validateAmount(amount: number, method: string): void {
    if (typeof amount !== "number" || !Number.isFinite(amount)) {
      throw numwizError(
        TypeError,
        "Currency",
        method,
        "invalid amount",
        "a finite JavaScript number",
        amount
      );
    }
  }
}

export default Currency;
