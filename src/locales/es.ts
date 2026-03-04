import type { LocaleData } from "../types";

const locale: LocaleData = {
  code: "es",
  name: "Español",
  numberSystem: "western",
  zero: "cero",
  ones: [
    "",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ],
  tens: [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ],
  tenConnector: " y ",
  twenties: [
    "veinte",
    "veintiuno",
    "veintidós",
    "veintitrés",
    "veinticuatro",
    "veinticinco",
    "veintiséis",
    "veintisiete",
    "veintiocho",
    "veintinueve",
  ],

  scales: [
    { value: 1e18, singular: "trillón", plural: "trillones" },
    { value: 1e12, singular: "billón", plural: "billones" },
    { value: 1e6, singular: "millón", plural: "millones" },
    { value: 1e3, singular: "mil", plural: "mil" },
    { value: 1e2, singular: "ciento", plural: "cientos" },
  ],

  abbreviations: {
    western: [
      { value: 1e12, symbol: "B" },
      { value: 1e6, symbol: "M" },
      { value: 1e3, symbol: "K" },
    ],
  },

  negative: "menos",
  point: "punto",
  and: "",
  ordinals: (n: number) => `${n}º`,

  currencies: {
    EUR: {
      name: "euro",
      plural: "euros",
      subunit: "céntimo",
      subunitPlural: "céntimos",
      symbol: "€",
    },
    USD: {
      name: "dólar",
      plural: "dólares",
      subunit: "centavo",
      subunitPlural: "centavos",
      symbol: "$",
    },
    MXN: {
      name: "peso",
      plural: "pesos",
      subunit: "centavo",
      subunitPlural: "centavos",
      symbol: "$",
    },
  },
};

export default locale;
