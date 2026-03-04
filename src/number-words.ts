import type { LocaleData, LocaleRegistry } from "./types";
import en from "./locales/en";
import hi from "./locales/hi";
import es from "./locales/es";
import fr from "./locales/fr";
import de from "./locales/de";
import ar from "./locales/ar";
import bn from "./locales/bn";
import mr from "./locales/mr";
import gu from "./locales/gu";
import ta from "./locales/ta";

const locales: LocaleRegistry = { en, hi, es, fr, de, ar, bn, mr, gu, ta };

class NumberWords {
  static registerLocale(code: string, localeData: LocaleData): void {
    locales[code] = localeData;
  }

  static getLocales(): string[] {
    return Object.keys(locales);
  }

  static _getLocale(code: string): LocaleData | null {
    return locales[code] || null;
  }

  static toWords(
    num: number,
    locale = "en",
    system: string | null = null
  ): string {
    const loc = locales[locale];
    if (!loc)
      throw new Error(
        `Locale "${locale}" not found. Available: ${Object.keys(locales).join(
          ", "
        )}`
      );

    if (num === 0) return loc.zero;

    let result = "";

    if (num < 0) {
      result += loc.negative + " ";
      num = Math.abs(num);
    }

    const intPart = Math.floor(num);
    const decPart = num.toString().split(".")[1];

    const useSystem = system || loc.numberSystem || "western";
    const scales =
      useSystem === "indian" ? loc.indianScales || loc.scales : loc.scales;

    result += NumberWords._intToWords(intPart, loc, scales);

    if (decPart) {
      result += ` ${loc.point} `;
      result += decPart
        .split("")
        .map((d) => {
          return loc.isUnique1to99
            ? loc.ones[parseInt(d)]
            : loc.ones[parseInt(d)] || loc.zero;
        })
        .join(" ");
    }

    return result.trim();
  }

  static _intToWords(
    num: number,
    loc: LocaleData,
    scales: LocaleData["scales"]
  ): string {
    if (num === 0) return "";

    if (loc.isUnique1to99 && num < 100) {
      return loc.ones[num] || "";
    }

    if (!loc.isUnique1to99 && num < 20) {
      return loc.ones[num] || "";
    }

    if (!loc.isUnique1to99 && num < 100) {
      return NumberWords._tensToWords(num, loc);
    }

    const compoundOnes = loc.compoundOnes || loc.ones;
    const compactJoin = loc.compactScales === true;
    const joiner = compactJoin ? "" : " ";

    for (const scale of scales) {
      if (num >= scale.value) {
        const count = Math.floor(num / scale.value);
        const remainder = num % scale.value;

        let word = "";

        if (scale.value === 100) {
          const countWord =
            count < 20
              ? compoundOnes[count] || loc.ones[count]
              : NumberWords._intToWords(count, loc, scales);
          word = countWord + joiner + scale.singular;
        } else if (scale.value === 1000 && loc.code === "es" && count === 1) {
          word = scale.singular;
        } else if (scale.value === 1000 && compactJoin) {
          const countWord =
            count === 1
              ? compoundOnes[1]
              : NumberWords._intToWords(count, loc, scales);
          word = countWord + scale.singular;
        } else {
          const countWord = NumberWords._intToWords(count, loc, scales);
          const scaleName =
            count > 1 ? scale.plural || scale.singular : scale.singular;
          word = countWord + " " + scaleName;
        }

        if (remainder > 0) {
          const connector = remainder < 100 && loc.and ? ` ${loc.and} ` : " ";
          word += connector + NumberWords._intToWords(remainder, loc, scales);
        }

        return word.trim();
      }
    }

    return "";
  }

  static _tensToWords(num: number, loc: LocaleData): string {
    const ten = Math.floor(num / 10);
    const one = num % 10;

    if (loc.twenties && ten === 2) {
      return loc.twenties[one] || "";
    }

    if (loc.onesBeforeTens) {
      if (one === 0) return loc.tens![ten] ?? "";
      const connector = loc.tenConnector || "und";
      const onesArr = loc.compoundOnes || loc.ones;
      return `${onesArr[one]}${connector}${loc.tens![ten]}`;
    }

    if (loc.code === "fr") {
      if (num >= 70 && num < 80) {
        return (
          (loc.tens![6] ?? "") +
          (num === 71 ? `-et-${loc.ones[11]}` : `-${loc.ones[num - 60]}`)
        );
      }
      if (num >= 90) {
        return (loc.tens![8] ?? "") + `-${loc.ones[num - 80]}`;
      }
    }

    if (one === 0) return loc.tens![ten] ?? "";
    const connector = loc.tenConnector || " ";
    return `${loc.tens![ten]}${connector}${loc.ones[one]}`.trim();
  }

  static currencyToWords(
    amount: number,
    currencyCode = "USD",
    locale = "en",
    system: string | null = null
  ): string {
    const loc = locales[locale];
    if (!loc) throw new Error(`Locale "${locale}" not found`);

    const curr = loc.currencies[currencyCode];
    if (!curr)
      throw new Error(
        `Currency "${currencyCode}" not found in locale "${locale}"`
      );

    const intPart = Math.floor(Math.abs(amount));
    const decPart = Math.round((Math.abs(amount) - intPart) * 100);

    let result = "";

    if (amount < 0) result += loc.negative + " ";

    const mainWords = NumberWords.toWords(intPart, locale, system);
    const currName = intPart === 1 ? curr.name : curr.plural;
    result += `${mainWords} ${currName}`;

    if (decPart > 0) {
      const subWords = NumberWords.toWords(decPart, locale, system);
      const subName = decPart === 1 ? curr.subunit : curr.subunitPlural;
      result += ` ${loc.and || "and"} ${subWords} ${subName}`;
    }

    return result.trim();
  }
}

export default NumberWords;
