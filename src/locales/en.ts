import type { LocaleData } from "../types";

const locale: LocaleData = {
  code: "en",
  name: "English",
  numberSystem: "western",

  zero: "zero",
  ones: [
    "",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
  ],
  tens: [
    "",
    "",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
  ],

  scales: [
    { value: 1e18, singular: "quintillion", plural: "quintillion" },
    { value: 1e15, singular: "quadrillion", plural: "quadrillion" },
    { value: 1e12, singular: "trillion", plural: "trillion" },
    { value: 1e9, singular: "billion", plural: "billion" },
    { value: 1e6, singular: "million", plural: "million" },
    { value: 1e3, singular: "thousand", plural: "thousand" },
    { value: 1e2, singular: "hundred", plural: "hundred" },
  ],

  indianScales: [
    { value: 1e13, singular: "neel", plural: "neel" },
    { value: 1e11, singular: "kharab", plural: "kharab" },
    { value: 1e9, singular: "arab", plural: "arab" },
    { value: 1e7, singular: "crore", plural: "crore" },
    { value: 1e5, singular: "lakh", plural: "lakh" },
    { value: 1e3, singular: "thousand", plural: "thousand" },
    { value: 1e2, singular: "hundred", plural: "hundred" },
  ],

  abbreviations: {
    western: [
      { value: 1e18, symbol: "Qi" },
      { value: 1e15, symbol: "Qa" },
      { value: 1e12, symbol: "T" },
      { value: 1e9, symbol: "B" },
      { value: 1e6, symbol: "M" },
      { value: 1e3, symbol: "K" },
    ],
    indian: [
      { value: 1e11, symbol: "Kh" },
      { value: 1e9, symbol: "Ar" },
      { value: 1e7, symbol: "Cr" },
      { value: 1e5, symbol: "L" },
      { value: 1e3, symbol: "K" },
    ],
  },

  and: "and",
  negative: "negative",
  point: "point",
  comma: "comma",

  ordinals: (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  },

  currencies: {
    USD: {
      name: "dollar",
      plural: "dollars",
      subunit: "cent",
      subunitPlural: "cents",
      symbol: "$",
    },
    EUR: {
      name: "euro",
      plural: "euros",
      subunit: "cent",
      subunitPlural: "cents",
      symbol: "€",
    },
    GBP: {
      name: "pound",
      plural: "pounds",
      subunit: "penny",
      subunitPlural: "pence",
      symbol: "£",
    },
    INR: {
      name: "rupee",
      plural: "rupees",
      subunit: "paisa",
      subunitPlural: "paise",
      symbol: "₹",
    },
    JPY: {
      name: "yen",
      plural: "yen",
      subunit: "sen",
      subunitPlural: "sen",
      symbol: "¥",
    },
    CNY: {
      name: "yuan",
      plural: "yuan",
      subunit: "fen",
      subunitPlural: "fen",
      symbol: "¥",
    },
    BDT: {
      name: "taka",
      plural: "taka",
      subunit: "poisha",
      subunitPlural: "poisha",
      symbol: "৳",
    },
    AED: {
      name: "dirham",
      plural: "dirhams",
      subunit: "fils",
      subunitPlural: "fils",
      symbol: "د.إ",
    },
    SAR: {
      name: "riyal",
      plural: "riyals",
      subunit: "halala",
      subunitPlural: "halalas",
      symbol: "﷼",
    },
  },
};

export default locale;
