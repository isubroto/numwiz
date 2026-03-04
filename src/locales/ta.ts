import type { LocaleData } from "../types";

const locale: LocaleData = {
  code: "ta",
  name: "தமிழ்",
  numberSystem: "indian",
  isUnique1to99: false,
  zero: "பூஜ்ஜியம்",

  ones: [
    "",
    "ஒன்று",
    "இரண்டு",
    "மூன்று",
    "நான்கு",
    "ஐந்து",
    "ஆறு",
    "ஏழு",
    "எட்டு",
    "ஒன்பது",
    "பத்து",
    "பதினொன்று",
    "பன்னிரண்டு",
    "பதிமூன்று",
    "பதினான்கு",
    "பதினைந்து",
    "பதினாறு",
    "பதினேழு",
    "பதினெட்டு",
    "பத்தொன்பது",
  ],

  tens: [
    "",
    "",
    "இருபது",
    "முப்பது",
    "நாற்பது",
    "ஐம்பது",
    "அறுபது",
    "எழுபது",
    "எண்பது",
    "தொண்ணூறு",
  ],

  tenConnector: "த்தி ",

  scales: [
    { value: 1e12, singular: "நிதி", plural: "நிதி" },
    { value: 1e11, singular: "கடை", plural: "கடை" },
    { value: 1e9, singular: "நூறு கோடி", plural: "நூறு கோடி" },
    { value: 1e7, singular: "கோடி", plural: "கோடி" },
    { value: 1e5, singular: "லட்சம்", plural: "லட்சம்" },
    { value: 1e3, singular: "ஆயிரம்", plural: "ஆயிரம்" },
    { value: 1e2, singular: "நூறு", plural: "நூறு" },
  ],

  abbreviations: {
    indian: [
      { value: 1e7, symbol: "கோ" },
      { value: 1e5, symbol: "ல" },
      { value: 1e3, symbol: "ஆ" },
    ],
  },

  negative: "கழித்தல்",
  point: "புள்ளி",
  and: "",

  ordinals: (n: number) => `${n}வது`,

  currencies: {
    INR: {
      name: "ரூபாய்",
      plural: "ரூபாய்",
      subunit: "பைசா",
      subunitPlural: "பைசா",
      symbol: "₹",
    },
  },
};

export default locale;
