class Conversion {
  // ---- Type Conversion ----
  static toInteger(v: string | number): number {
    return parseInt(String(v), 10);
  }
  static toFloat(v: string | number): number {
    return parseFloat(String(v));
  }
  static toNumber(v: unknown): number {
    const n = Number(v);
    if (isNaN(n)) throw new Error(`Cannot convert "${v}"`);
    return n;
  }
  static toString(n: number): string {
    return String(n);
  }

  // ---- Base Conversion ----
  static toBinary(n: number): string {
    return (n >>> 0).toString(2);
  }
  static toOctal(n: number): string {
    return (n >>> 0).toString(8);
  }
  static toHex(n: number): string {
    return (n >>> 0).toString(16).toUpperCase();
  }
  static toBase(n: number, base: number): string {
    return n.toString(base);
  }
  static fromBase(str: string, base: number): number {
    return parseInt(str, base);
  }

  // ---- Angle Conversion ----
  static degreesToRadians(d: number): number {
    return (d * Math.PI) / 180;
  }
  static radiansToDegrees(r: number): number {
    return (r * 180) / Math.PI;
  }

  // ---- Temperature ----
  static celsiusToFahrenheit(c: number): number {
    return (c * 9) / 5 + 32;
  }
  static fahrenheitToCelsius(f: number): number {
    return ((f - 32) * 5) / 9;
  }
  static celsiusToKelvin(c: number): number {
    return c + 273.15;
  }
  static kelvinToCelsius(k: number): number {
    return k - 273.15;
  }
  static fahrenheitToKelvin(f: number): number {
    return Conversion.celsiusToKelvin(Conversion.fahrenheitToCelsius(f));
  }
  static kelvinToFahrenheit(k: number): number {
    return Conversion.celsiusToFahrenheit(Conversion.kelvinToCelsius(k));
  }

  // ---- Length ----
  static kmToMiles(km: number): number {
    return km * 0.621371;
  }
  static milesToKm(mi: number): number {
    return mi * 1.60934;
  }
  static cmToInches(cm: number): number {
    return cm * 0.393701;
  }
  static inchesToCm(i: number): number {
    return i * 2.54;
  }
  static feetToMeters(ft: number): number {
    return ft * 0.3048;
  }
  static metersToFeet(m: number): number {
    return m / 0.3048;
  }

  // ---- Weight ----
  static kgToLbs(kg: number): number {
    return kg * 2.20462;
  }
  static lbsToKg(lb: number): number {
    return lb * 0.453592;
  }
  static gramsToOunces(g: number): number {
    return g * 0.035274;
  }
  static ouncesToGrams(oz: number): number {
    return oz * 28.3495;
  }

  // ---- Data ----
  static bytesToKB(b: number): number {
    return b / 1024;
  }
  static bytesToMB(b: number): number {
    return b / (1024 * 1024);
  }
  static bytesToGB(b: number): number {
    return b / (1024 * 1024 * 1024);
  }

  // ---- Time ----
  static secondsToMinutes(s: number): number {
    return s / 60;
  }
  static minutesToHours(m: number): number {
    return m / 60;
  }
  static hoursToDays(h: number): number {
    return h / 24;
  }
  /** @deprecated Use hoursToDays instead */
  static hoursTodays(h: number): number {
    return Conversion.hoursToDays(h);
  }
  static daysToYears(d: number): number {
    return d / 365.25;
  }
  static msToSeconds(ms: number): number {
    return ms / 1000;
  }
}

export default Conversion;
