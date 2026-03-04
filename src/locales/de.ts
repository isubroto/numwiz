import type { LocaleData } from "../types";

const locale: LocaleData = {
  code: "de",
  name: "Deutsch",
  numberSystem: "western",
  zero: "null",

  ones: [
    "",
    "eins",
    "zwei",
    "drei",
    "vier",
    "fünf",
    "sechs",
    "sieben",
    "acht",
    "neun",
    "zehn",
    "elf",
    "zwölf",
    "dreizehn",
    "vierzehn",
    "fünfzehn",
    "sechzehn",
    "siebzehn",
    "achtzehn",
    "neunzehn",
  ],

  compoundOnes: [
    "",
    "ein",
    "zwei",
    "drei",
    "vier",
    "fünf",
    "sechs",
    "sieben",
    "acht",
    "neun",
    "zehn",
    "elf",
    "zwölf",
    "dreizehn",
    "vierzehn",
    "fünfzehn",
    "sechzehn",
    "siebzehn",
    "achtzehn",
    "neunzehn",
  ],

  tens: [
    "",
    "",
    "zwanzig",
    "dreißig",
    "vierzig",
    "fünfzig",
    "sechzig",
    "siebzig",
    "achtzig",
    "neunzig",
  ],

  onesBeforeTens: true,
  tenConnector: "und",
  compactScales: true,

  scales: [
    { value: 1e12, singular: "Billion", plural: "Billionen" },
    { value: 1e9, singular: "Milliarde", plural: "Milliarden" },
    { value: 1e6, singular: "Million", plural: "Millionen" },
    { value: 1e3, singular: "tausend", plural: "tausend" },
    { value: 1e2, singular: "hundert", plural: "hundert" },
  ],

  abbreviations: {
    western: [
      { value: 1e9, symbol: "Mrd" },
      { value: 1e6, symbol: "Mio" },
      { value: 1e3, symbol: "K" },
    ],
  },

  negative: "minus",
  point: "Komma",
  and: "",
  ordinals: (n: number) => `${n}.`,

  currencies: {
    EUR: {
      name: "Euro",
      plural: "Euro",
      subunit: "Cent",
      subunitPlural: "Cent",
      symbol: "€",
    },
    USD: {
      name: "Dollar",
      plural: "Dollar",
      subunit: "Cent",
      subunitPlural: "Cents",
      symbol: "$",
    },
    CHF: {
      name: "Franken",
      plural: "Franken",
      subunit: "Rappen",
      subunitPlural: "Rappen",
      symbol: "CHF",
    },
  },
};

export default locale;
