# NumWiz Practical Examples

These examples use the public APIs exactly as package consumers would use them.

## Invoice Calculator

```ts
import { Currency, Financial } from "numwiz";

const items = [
  { name: "Consulting", quantity: 8, unitPrice: 2500 },
  { name: "Support", quantity: 3, unitPrice: 1200 },
];

const subtotal = items.reduce(
  (sum, item) => sum + item.quantity * item.unitPrice,
  0
);
const vat = Financial.taxAmount(subtotal, 15);
const total = Financial.priceWithTax(subtotal, 15);

const invoice = {
  subtotal: Currency.format(subtotal, "BDT", "bn-BD"),
  vat: Currency.format(vat, "BDT", "bn-BD"),
  total: Currency.format(total, "BDT", "bn-BD"),
};
```

## EMI Calculator

```ts
import { Currency, Financial } from "numwiz";

const principal = 1_000_000;
const annualRate = 9.5;
const months = 120;

const monthlyPayment = Financial.emi(principal, annualRate, months);
Currency.format(monthlyPayment, "BDT", "en-BD");
```

## Bangladesh Taka Words

```ts
import { Currency } from "numwiz";

Currency.toWordsIndian(1250.5, "BDT", "en");
// "one thousand two hundred fifty taka and fifty poisha"

Currency.toWordsIndian(1250.5, "BDT", "bn");
// Bengali taka words when using the bundled Bengali locale
```

## Statistics Analysis

```ts
import { Statistics } from "numwiz";

const sales = [12, 18, 20, 20, 21, 25, 32, 40];

const summary = {
  mean: Statistics.mean(sales),
  median: Statistics.median(sales),
  quartiles: Statistics.quartiles(sales),
  sampleStdDev: Statistics.sampleStdDev(sales),
  skewness: Statistics.skewness(sales),
};
```

## Matrix Solver

```ts
import { Matrix } from "numwiz";

// 3x + 2y = 18
// x + 2y = 10
const solution = Matrix.solve(
  [
    [3, 2],
    [1, 2],
  ],
  [18, 10]
);

// [[4], [3]]
```

## FFT Signal Analysis

```ts
import { FFT, Signal } from "numwiz";

const sampleRate = 64;
const signal = Array.from({ length: sampleRate }, (_, n) =>
  Math.cos((2 * Math.PI * 8 * n) / sampleRate)
);

const windowed = Signal.applyWindow(signal, Signal.windowHann(sampleRate));
const spectrum = FFT.rfft(windowed);
const magnitudes = FFT.magnitude(spectrum);
const peakBin = magnitudes.indexOf(Math.max(...magnitudes.slice(1)));
const peakFrequency = FFT.rfftfreq(sampleRate, 1 / sampleRate)[peakBin];
```

## Precision Finance

```ts
import { BigPrecision, RoundingMode } from "numwiz";

const principal = new BigPrecision("100000.00");
const annualRate = new BigPrecision("0.085");
const days = new BigPrecision("45");

const interest = principal.mul(annualRate).mul(days).div("365");
const rounded = interest.quantize(2, RoundingMode.ROUND_HALF_EVEN);

rounded.toFixed(2);
```

## Repeatable Random Samples

```ts
import { Random } from "numwiz";

const rng = Random.seed("experiment-42");
const sample = rng.generateList(5, 1, 100);
```
