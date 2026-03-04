import type { LocaleData } from "../types";

const locale: LocaleData = {
  code: "ar",
  name: "العربية",
  numberSystem: "western",
  zero: "صفر",
  ones: [
    "",
    "واحد",
    "اثنان",
    "ثلاثة",
    "أربعة",
    "خمسة",
    "ستة",
    "سبعة",
    "ثمانية",
    "تسعة",
    "عشرة",
    "أحد عشر",
    "اثنا عشر",
    "ثلاثة عشر",
    "أربعة عشر",
    "خمسة عشر",
    "ستة عشر",
    "سبعة عشر",
    "ثمانية عشر",
    "تسعة عشر",
  ],
  tens: [
    "",
    "",
    "عشرون",
    "ثلاثون",
    "أربعون",
    "خمسون",
    "ستون",
    "سبعون",
    "ثمانون",
    "تسعون",
  ],

  scales: [
    { value: 1e12, singular: "تريليون", plural: "تريليونات" },
    { value: 1e9, singular: "مليار", plural: "مليارات" },
    { value: 1e6, singular: "مليون", plural: "ملايين" },
    { value: 1e3, singular: "ألف", plural: "آلاف" },
    { value: 1e2, singular: "مائة", plural: "مئات" },
  ],

  abbreviations: {
    western: [
      { value: 1e9, symbol: "مليار" },
      { value: 1e6, symbol: "مليون" },
      { value: 1e3, symbol: "ألف" },
    ],
  },

  negative: "سالب",
  point: "فاصلة",
  and: "و",
  ordinals: (n: number) => `${n}`,

  currencies: {
    SAR: {
      name: "ريال",
      plural: "ريالات",
      subunit: "هللة",
      subunitPlural: "هللات",
      symbol: "﷼",
    },
    AED: {
      name: "درهم",
      plural: "دراهم",
      subunit: "فلس",
      subunitPlural: "فلوس",
      symbol: "د.إ",
    },
    EGP: {
      name: "جنيه",
      plural: "جنيهات",
      subunit: "قرش",
      subunitPlural: "قروش",
      symbol: "ج.م",
    },
    USD: {
      name: "دولار",
      plural: "دولارات",
      subunit: "سنت",
      subunitPlural: "سنتات",
      symbol: "$",
    },
  },
};

export default locale;
