import NumberWords from "./number-words";

class Currency {
  // ==========================================
  // WESTERN FORMAT: $1,234,567.89
  // ==========================================

  static format(amount: number, currency = "USD", locale = "en-US"): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  }

  // ==========================================
  // INDIAN FORMAT: ₹12,34,567.89
  // ==========================================

  static formatIndian(amount: number, symbol = "₹"): string {
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
    return NumberWords.currencyToWords(amount, currency, locale, "western");
  }

  static toWordsIndian(
    amount: number,
    currency = "INR",
    locale = "en"
  ): string {
    return NumberWords.currencyToWords(amount, currency, locale, "indian");
  }

  static toWordsHindi(amount: number, currency = "INR"): string {
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
    return (amount / fromRate) * toRate;
  }
}

export default Currency;
