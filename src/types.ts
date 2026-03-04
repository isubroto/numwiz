// ===================================================
// NumWiz — Shared Type Definitions
// ===================================================

// ---- Locale Types ----

export interface ScaleEntry {
  value: number;
  singular: string;
  plural: string;
}

export interface AbbreviationEntry {
  value: number;
  symbol: string;
}

export interface CurrencyEntry {
  name: string;
  plural: string;
  subunit: string;
  subunitPlural: string;
  symbol: string;
}

export interface LocaleData {
  code: string;
  name: string;
  numberSystem: "western" | "indian";
  zero: string;
  ones: string[];
  tens?: string[];
  compoundOnes?: string[];
  twenties?: string[];
  scales: ScaleEntry[];
  indianScales?: ScaleEntry[];
  abbreviations: {
    western?: AbbreviationEntry[];
    indian?: AbbreviationEntry[];
  };
  negative: string;
  point: string;
  and?: string;
  comma?: string;
  ordinals?: (n: number) => string;
  currencies: Record<string, CurrencyEntry>;
  isUnique1to99?: boolean;
  compactScales?: boolean;
  onesBeforeTens?: boolean;
  tenConnector?: string;
  onesConnector?: string;
}

// ---- LocaleRegistry ----

export type LocaleRegistry = Record<string, LocaleData>;

// ---- Matrix Types ----

export type Matrix2D = number[][];

export interface LUResult {
  L: Matrix2D;
  U: Matrix2D;
  P: Matrix2D;
}

export interface QRResult {
  Q: Matrix2D;
  R: Matrix2D;
}

export interface ComplexNumber {
  real: number;
  imag: number;
}

export type EigenvalueResult = number | ComplexNumber;

// ---- Financial Types ----

export interface AmortizationEntry {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

// ---- Random Types ----

export interface WeightedItem<T = unknown> {
  value: T;
  weight: number;
}

// ---- NumWiz Options ----

export interface NumWizOptions {
  safe?: boolean;
}
