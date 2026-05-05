export type NumWizErrorConstructor =
  | typeof Error
  | typeof RangeError
  | typeof TypeError;

export function describeValue(value: unknown): string {
  if (typeof value === "number") {
    if (Number.isNaN(value)) return "NaN";
    if (value === Infinity) return "Infinity";
    if (value === -Infinity) return "-Infinity";
    return String(value);
  }

  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "function") return `[Function ${value.name || "anonymous"}]`;

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function numwizError(
  ErrorType: NumWizErrorConstructor,
  moduleName: string,
  methodName: string,
  problem: string,
  expected?: string,
  received?: unknown
): Error {
  const details = [
    `[NumWiz.${moduleName}.${methodName}] ${problem}`,
    expected ? `Expected: ${expected}` : "",
    arguments.length >= 6 ? `Received: ${describeValue(received)}` : "",
  ].filter(Boolean);

  return new ErrorType(details.join(". "));
}
