import type { LocaleData } from "../types";

const locale: LocaleData = {
  code: "fr",
  name: "Français",
  numberSystem: "western",
  zero: "zéro",
  ones: [
    "",
    "un",
    "deux",
    "trois",
    "quatre",
    "cinq",
    "six",
    "sept",
    "huit",
    "neuf",
    "dix",
    "onze",
    "douze",
    "treize",
    "quatorze",
    "quinze",
    "seize",
    "dix-sept",
    "dix-huit",
    "dix-neuf",
  ],
  tens: [
    "",
    "",
    "vingt",
    "trente",
    "quarante",
    "cinquante",
    "soixante",
    "soixante",
    "quatre-vingt",
    "quatre-vingt",
  ],

  scales: [
    { value: 1e18, singular: "trillion", plural: "trillions" },
    { value: 1e12, singular: "billion", plural: "billions" },
    { value: 1e6, singular: "million", plural: "millions" },
    { value: 1e3, singular: "mille", plural: "mille" },
    { value: 1e2, singular: "cent", plural: "cents" },
  ],

  abbreviations: {
    western: [
      { value: 1e12, symbol: "Md" },
      { value: 1e6, symbol: "M" },
      { value: 1e3, symbol: "K" },
    ],
  },

  negative: "moins",
  point: "virgule",
  and: "et",
  ordinals: (n: number) => (n === 1 ? "1er" : `${n}e`),

  currencies: {
    EUR: {
      name: "euro",
      plural: "euros",
      subunit: "centime",
      subunitPlural: "centimes",
      symbol: "€",
    },
    USD: {
      name: "dollar",
      plural: "dollars",
      subunit: "cent",
      subunitPlural: "cents",
      symbol: "$",
    },
  },
};

export default locale;
