/**
 * ═══════════════════════════════════════════════════════════
 * NumWiz Matrix Module
 * ═══════════════════════════════════════════════════════════
 *
 * STATIC API — plain arrays in, plain arrays out
 * INSTANCE API — chainable, call .toArray() for 2D output
 *
 * Static Matrix.toArray(m)  → flat 1D array [1,2,3,4]
 * Instance .toArray()       → 2D array [[1,2],[3,4]]
 */

import type { LUResult, QRResult, EigenvalueResult, Matrix2D } from "./types";
import { numwizError } from "./errors";

class Matrix {
  // ═══════════════════════════════════════
  // PROPERTIES
  // ═══════════════════════════════════════

  private _data: Matrix2D;
  private _rows: number;
  private _cols: number;

  // ═══════════════════════════════════════
  // CONSTRUCTOR
  // ═══════════════════════════════════════

  constructor(data: Matrix2D | number[]) {
    const validated = Matrix._validate(data);
    this._data = validated;
    this._rows = validated.length;
    this._cols = validated[0].length;
  }

  // ═══════════════════════════════════════
  // INTERNAL VALIDATORS
  // ═══════════════════════════════════════

  private static _validate(data: unknown): Matrix2D {
    if (!Array.isArray(data) || data.length === 0) {
      throw numwizError(
        TypeError,
        "Matrix",
        "validate",
        "invalid matrix input",
        "a non-empty 2D numeric array or a numeric vector",
        data
      );
    }
    if (!Array.isArray(data[0])) {
      data = [data];
    }
    const d = data as number[][];
    const cols = d[0].length;
    if (cols === 0) {
      throw numwizError(
        TypeError,
        "Matrix",
        "validate",
        "empty matrix row",
        "each row to contain at least one number",
        d[0]
      );
    }
    for (let i = 0; i < d.length; i++) {
      if (!Array.isArray(d[i])) {
        throw numwizError(
          TypeError,
          "Matrix",
          "validate",
          `row ${i} is not an array`,
          "a rectangular 2D numeric array",
          d[i]
        );
      }
      if (d[i].length !== cols) {
        throw numwizError(
          TypeError,
          "Matrix",
          "validate",
          `row ${i} has ${d[i].length} columns`,
          `${cols} columns`,
          d[i]
        );
      }
      for (let j = 0; j < cols; j++) {
        if (typeof d[i][j] !== "number" || !Number.isFinite(d[i][j])) {
          throw numwizError(
            TypeError,
            "Matrix",
            "validate",
            `invalid element at [${i}][${j}]`,
            "a finite JavaScript number",
            d[i][j]
          );
        }
      }
    }
    return d.map((row) => [...row]);
  }

  private static _ensure(m: Matrix2D | Matrix): Matrix2D {
    if (m instanceof Matrix) return m._data.map((r) => [...r]);
    return Matrix._validate(m);
  }

  private static _assertSquare(m: Matrix2D, method: string): void {
    if (m.length !== m[0].length) {
      throw numwizError(
        RangeError,
        "Matrix",
        method,
        "matrix must be square",
        "rows === columns",
        { rows: m.length, cols: m[0].length }
      );
    }
  }

  private static _assertSameSize(
    a: Matrix2D,
    b: Matrix2D,
    method: string
  ): void {
    if (a.length !== b.length || a[0].length !== b[0].length) {
      throw numwizError(
        RangeError,
        "Matrix",
        method,
        "matrix size mismatch",
        "matrices with the same row and column counts",
        {
          left: [a.length, a[0].length],
          right: [b.length, b[0].length],
        }
      );
    }
  }

  private static _assertDims(rows: number, cols: number): void {
    if (
      !Number.isInteger(rows) ||
      !Number.isInteger(cols) ||
      rows <= 0 ||
      cols <= 0
    ) {
      throw numwizError(
        RangeError,
        "Matrix",
        "dimensions",
        "invalid matrix dimensions",
        "positive integer row and column counts",
        { rows, cols }
      );
    }
  }

  private static _assertIndex(m: Matrix2D, row: number, col: number): void {
    if (row < 0 || row >= m.length || col < 0 || col >= m[0].length) {
      throw numwizError(
        RangeError,
        "Matrix",
        "index",
        "matrix index out of range",
        `row in [0, ${m.length - 1}] and col in [0, ${m[0].length - 1}]`,
        { row, col }
      );
    }
  }

  private static _cleanZeros(m: Matrix2D): Matrix2D {
    return m.map((row) => row.map((v) => (Math.abs(v) < 1e-12 ? 0 : v)));
  }

  // ═══════════════════════════════════════════
  // CREATION — all return plain number[][]
  // ═══════════════════════════════════════════

  static create(rows: number, cols: number, fillValue = 0): Matrix2D {
    Matrix._assertDims(rows, cols);
    return Array.from({ length: rows }, () => Array(cols).fill(fillValue));
  }

  static identity(n: number): Matrix2D {
    Matrix._assertDims(n, n);
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
    );
  }

  static zeros(rows: number, cols: number): Matrix2D {
    return Matrix.create(rows, cols, 0);
  }

  static ones(rows: number, cols: number): Matrix2D {
    return Matrix.create(rows, cols, 1);
  }

  static fill(rows: number, cols: number, value: number): Matrix2D {
    return Matrix.create(rows, cols, value);
  }

  static diagonal(values: number[]): Matrix2D {
    const n = values.length;
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => (i === j ? values[i] : 0))
    );
  }

  static random(
    rows: number,
    cols: number,
    min = 0,
    max = 1,
    integers = false
  ): Matrix2D {
    Matrix._assertDims(rows, cols);
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => {
        const val = Math.random() * (max - min) + min;
        return integers ? Math.floor(val) : val;
      })
    );
  }

  static fromFlat(flat: number[], rows: number, cols: number): Matrix2D {
    if (flat.length !== rows * cols) {
      throw new RangeError(
        `Array length ${flat.length} doesn't match ${rows}×${cols} = ${
          rows * cols
        }`
      );
    }
    const data: Matrix2D = [];
    for (let i = 0; i < rows; i++) {
      data.push(flat.slice(i * cols, (i + 1) * cols));
    }
    return data;
  }

  static fromArray(
    input: number[] | Matrix2D,
    rows?: number,
    cols?: number
  ): Matrix2D {
    if (typeof rows === "number" && typeof cols === "number") {
      if (!Array.isArray(input)) {
        throw new TypeError("First argument must be an array");
      }
      if (!Array.isArray(input[0])) {
        if ((input as number[]).length !== rows * cols) {
          throw new RangeError(
            `Array length ${
              (input as number[]).length
            } doesn't match ${rows}×${cols} = ${rows * cols}`
          );
        }
        return Matrix.fromFlat(input as number[], rows, cols);
      }
    }
    return Matrix._validate(input);
  }

  static toArray(m: Matrix2D | Matrix): Matrix2D {
    const data = Matrix._ensure(m);
    return data.map((r) => [...r]);
  }

  static columnVector(values: number[]): Matrix2D {
    return values.map((v) => [v]);
  }

  static rowVector(values: number[]): Matrix2D {
    return [[...values]];
  }

  static rotation2D(angle: number): Matrix2D {
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    return [
      [c, -s],
      [s, c],
    ];
  }

  static scaling(...factors: number[]): Matrix2D {
    return Matrix.diagonal(factors);
  }

  static hilbert(n: number): Matrix2D {
    return Array.from({ length: n }, (_, i) =>
      Array.from({ length: n }, (_, j) => 1 / (i + j + 1))
    );
  }

  static vandermonde(values: number[], cols: number): Matrix2D {
    return values.map((v) =>
      Array.from({ length: cols }, (_, j) => Math.pow(v, j))
    );
  }

  static fromJSON(json: { data: Matrix2D }): Matrix2D {
    return Matrix._validate(json.data);
  }

  // ═══════════════════════════════════════
  // INSPECTION
  // ═══════════════════════════════════════

  static shape(m: Matrix2D | Matrix): [number, number] {
    const data = Matrix._ensure(m);
    return [data.length, data[0].length];
  }

  static rows(m: Matrix2D | Matrix): number {
    return Matrix._ensure(m).length;
  }

  static cols(m: Matrix2D | Matrix): number {
    return Matrix._ensure(m)[0].length;
  }

  static size(m: Matrix2D | Matrix): number {
    const data = Matrix._ensure(m);
    return data.length * data[0].length;
  }

  static get(m: Matrix2D | Matrix, row: number, col: number): number {
    const data = Matrix._ensure(m);
    Matrix._assertIndex(data, row, col);
    return data[row][col];
  }

  static set(m: Matrix2D, row: number, col: number, value: number): Matrix2D {
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new TypeError(`value must be a finite number, got ${value}`);
    }
    m = Matrix._ensure(m);
    Matrix._assertIndex(m, row, col);
    const result = m.map((r) => [...r]);
    result[row][col] = value;
    return result;
  }

  static getRow(m: Matrix2D | Matrix, row: number): number[] {
    const data = Matrix._ensure(m);
    if (row < 0 || row >= data.length) {
      throw new RangeError(
        `Row ${row} out of range for ${data.length}×${data[0].length} matrix`
      );
    }
    return [...data[row]];
  }

  static getCol(m: Matrix2D | Matrix, col: number): number[] {
    const data = Matrix._ensure(m);
    if (col < 0 || col >= data[0].length) {
      throw new RangeError(
        `Col ${col} out of range for ${data.length}×${data[0].length} matrix`
      );
    }
    return data.map((row) => row[col]);
  }

  static getDiagonal(m: Matrix2D | Matrix): number[] {
    const data = Matrix._ensure(m);
    const n = Math.min(data.length, data[0].length);
    return Array.from({ length: n }, (_, i) => data[i][i]);
  }

  static clone(m: Matrix2D | Matrix): Matrix2D {
    return Matrix._ensure(m);
  }

  static flatten(m: Matrix2D | Matrix): number[] {
    const data = Matrix._ensure(m);
    return ([] as number[]).concat(...data);
  }

  // ═══════════════════════════════════════
  // ARITHMETIC
  // ═══════════════════════════════════════

  static add(a: Matrix2D | Matrix, b: Matrix2D | Matrix): Matrix2D {
    const ma = Matrix._ensure(a);
    const mb = Matrix._ensure(b);
    Matrix._assertSameSize(ma, mb, "add");
    return ma.map((row, i) => row.map((v, j) => v + mb[i][j]));
  }

  static subtract(a: Matrix2D | Matrix, b: Matrix2D | Matrix): Matrix2D {
    const ma = Matrix._ensure(a);
    const mb = Matrix._ensure(b);
    Matrix._assertSameSize(ma, mb, "subtract");
    return ma.map((row, i) => row.map((v, j) => v - mb[i][j]));
  }

  static multiply(a: Matrix2D | Matrix, b: Matrix2D | Matrix): Matrix2D {
    const ma = Matrix._ensure(a);
    const mb = Matrix._ensure(b);
    if (ma[0].length !== mb.length) {
      throw new RangeError(
        `multiply: incompatible dimensions ${ma.length}×${ma[0].length} × ${mb.length}×${mb[0].length}`
      );
    }
    const rows = ma.length;
    const cols = mb[0].length;
    const k = mb.length;
    return Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) =>
        Array.from({ length: k }, (_, l) => ma[i][l] * mb[l][j]).reduce(
          (s, v) => s + v,
          0
        )
      )
    );
  }

  static scale(m: Matrix2D | Matrix, scalar: number): Matrix2D {
    if (typeof scalar !== "number" || Number.isNaN(scalar)) {
      throw new TypeError(`scalar must be a finite number, got ${scalar}`);
    }
    return Matrix._ensure(m).map((row) => row.map((v) => v * scalar));
  }

  static scalarMultiply(m: Matrix2D | Matrix, scalar: number): Matrix2D {
    return Matrix.scale(m, scalar);
  }

  static scalarDivide(m: Matrix2D | Matrix, scalar: number): Matrix2D {
    if (scalar === 0) throw new RangeError("Cannot divide by zero");
    return Matrix._ensure(m).map((row) => row.map((v) => v / scalar));
  }

  static scalarAdd(m: Matrix2D | Matrix, s: number): Matrix2D {
    return Matrix._ensure(m).map((row) => row.map((v) => v + s));
  }

  static scalarSubtract(m: Matrix2D | Matrix, s: number): Matrix2D {
    return Matrix._ensure(m).map((row) => row.map((v) => v - s));
  }

  static negate(m: Matrix2D | Matrix): Matrix2D {
    return Matrix._ensure(m).map((row) => row.map((v) => -v));
  }

  static hadamard(a: Matrix2D | Matrix, b: Matrix2D | Matrix): Matrix2D {
    const ma = Matrix._ensure(a);
    const mb = Matrix._ensure(b);
    Matrix._assertSameSize(ma, mb, "hadamard");
    return ma.map((row, i) => row.map((v, j) => v * mb[i][j]));
  }

  static elementDivide(a: Matrix2D | Matrix, b: Matrix2D | Matrix): Matrix2D {
    const ma = Matrix._ensure(a);
    const mb = Matrix._ensure(b);
    Matrix._assertSameSize(ma, mb, "elementDivide");
    return ma.map((row, i) =>
      row.map((v, j) => {
        if (mb[i][j] === 0)
          throw new RangeError(`Division by zero at [${i}][${j}]`);
        return v / mb[i][j];
      })
    );
  }

  static elementPower(m: Matrix2D | Matrix, exp: number): Matrix2D {
    return Matrix._ensure(m).map((row) => row.map((v) => Math.pow(v, exp)));
  }

  static power(m: Matrix2D | Matrix, n: number): Matrix2D {
    let data = Matrix._ensure(m);
    Matrix._assertSquare(data, "power");
    if (!Number.isInteger(n) || n < 0) {
      throw new RangeError("power: n must be a non-negative integer");
    }
    if (n === 0) return Matrix.identity(data.length);
    let result = Matrix.identity(data.length);
    for (let i = 0; i < n; i++) {
      result = Matrix.multiply(result, data);
    }
    return result;
  }

  // ═══════════════════════════════════════
  // TRANSFORMATIONS
  // ═══════════════════════════════════════

  static transpose(m: Matrix2D | Matrix): Matrix2D {
    const data = Matrix._ensure(m);
    const rows = data.length;
    const cols = data[0].length;
    return Array.from({ length: cols }, (_, j) =>
      Array.from({ length: rows }, (_, i) => data[i][j])
    );
  }

  static minor(m: Matrix2D | Matrix, row: number, col: number): Matrix2D {
    const data = Matrix._ensure(m);
    return data
      .filter((_, i) => i !== row)
      .map((r) => r.filter((_, j) => j !== col));
  }

  static cofactor(m: Matrix2D | Matrix, row: number, col: number): number {
    const data = Matrix._ensure(m);
    return (
      Math.pow(-1, row + col) * Matrix.determinant(Matrix.minor(data, row, col))
    );
  }

  static cofactorMatrix(m: Matrix2D | Matrix): Matrix2D {
    const data = Matrix._ensure(m);
    Matrix._assertSquare(data, "cofactorMatrix");
    return data.map((row, i) => row.map((_, j) => Matrix.cofactor(data, i, j)));
  }

  static adjugate(m: Matrix2D | Matrix): Matrix2D {
    return Matrix.transpose(Matrix.cofactorMatrix(m));
  }

  static inverse(m: Matrix2D | Matrix): Matrix2D {
    const data = Matrix._ensure(m);
    Matrix._assertSquare(data, "inverse");
    const det = Matrix.determinant(data);
    if (Math.abs(det) < 1e-10) {
      throw new Error("Matrix is singular and cannot be inverted");
    }
    const n = data.length;
    if (n === 1) return [[1 / data[0][0]]];
    const adj = Matrix.adjugate(data);
    return adj.map((row) => row.map((v) => v / det));
  }

  // ═══════════════════════════════════════
  // DECOMPOSITION & DETERMINANT
  // ═══════════════════════════════════════

  static determinant(m: Matrix2D | Matrix): number {
    const data = Matrix._ensure(m);
    Matrix._assertSquare(data, "determinant");
    const n = data.length;
    if (n === 1) return data[0][0];
    if (n === 2) return data[0][0] * data[1][1] - data[0][1] * data[1][0];
    return Matrix._determinantLU(data);
  }

  private static _determinantLU(m: Matrix2D): number {
    const n = m.length;
    const a = m.map((r) => [...r]);
    let det = 1;
    let swaps = 0;
    for (let col = 0; col < n; col++) {
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(a[row][col]) > Math.abs(a[maxRow][col])) maxRow = row;
      }
      if (maxRow !== col) {
        [a[col], a[maxRow]] = [a[maxRow], a[col]];
        swaps++;
      }
      if (Math.abs(a[col][col]) < 1e-12) return 0;
      det *= a[col][col];
      for (let row = col + 1; row < n; row++) {
        const factor = a[row][col] / a[col][col];
        for (let j = col; j < n; j++) {
          a[row][j] -= factor * a[col][j];
        }
      }
    }
    return det * (swaps % 2 === 0 ? 1 : -1);
  }

  static trace(m: Matrix2D | Matrix): number {
    const data = Matrix._ensure(m);
    Matrix._assertSquare(data, "trace");
    return data.reduce((s, row, i) => s + row[i], 0);
  }

  static sum(m: Matrix2D | Matrix): number {
    return Matrix.flatten(m).reduce((a, b) => a + b, 0);
  }

  static min(m: Matrix2D | Matrix): number {
    return Math.min(...Matrix.flatten(m));
  }

  static max(m: Matrix2D | Matrix): number {
    return Math.max(...Matrix.flatten(m));
  }

  static mean(m: Matrix2D | Matrix): number {
    const flat = Matrix.flatten(m);
    return flat.reduce((a, b) => a + b, 0) / flat.length;
  }

  static normFrobenius(m: Matrix2D | Matrix): number {
    return Math.sqrt(Matrix.flatten(m).reduce((s, v) => s + v * v, 0));
  }

  static norm(m: Matrix2D | Matrix): number {
    return Matrix.normFrobenius(m);
  }

  static normInf(m: Matrix2D | Matrix): number {
    const data = Matrix._ensure(m);
    return Math.max(
      ...data.map((row) => row.reduce((s, v) => s + Math.abs(v), 0))
    );
  }

  static norm1(m: Matrix2D | Matrix): number {
    const data = Matrix._ensure(m);
    const cols = data[0].length;
    return Math.max(
      ...Array.from({ length: cols }, (_, j) =>
        data.reduce((s, row) => s + Math.abs(row[j]), 0)
      )
    );
  }

  static rank(m: Matrix2D | Matrix): number {
    const rrefData = Matrix.rref(m);
    return rrefData.filter((row) => row.some((v) => Math.abs(v) > 1e-10))
      .length;
  }

  static sumAxis(m: Matrix2D | Matrix, axis: "row" | "col"): number[] {
    const data = Matrix._ensure(m);
    if (axis === "row") {
      return data.map((row) => row.reduce((a, b) => a + b, 0));
    }
    return Array.from({ length: data[0].length }, (_, j) =>
      data.reduce((s, row) => s + row[j], 0)
    );
  }

  // ═══════════════════════════════════════
  // ROW OPERATIONS
  // ═══════════════════════════════════════

  static swapRows(m: Matrix2D | Matrix, r1: number, r2: number): Matrix2D {
    const data = Matrix._ensure(m);
    const rows = data.length;
    if (r1 < 0 || r1 >= rows || r2 < 0 || r2 >= rows) {
      throw new RangeError(
        `Row indices ${r1}, ${r2} out of range for ${rows}-row matrix`
      );
    }
    const result = data.map((r) => [...r]);
    [result[r1], result[r2]] = [result[r2], result[r1]];
    return result;
  }

  static swapCols(m: Matrix2D | Matrix, c1: number, c2: number): Matrix2D {
    return Matrix.transpose(Matrix.swapRows(Matrix.transpose(m), c1, c2));
  }

  static scaleRow(m: Matrix2D | Matrix, row: number, scalar: number): Matrix2D {
    const data = Matrix._ensure(m);
    const result = data.map((r) => [...r]);
    result[row] = result[row].map((v) => v * scalar);
    return result;
  }

  static addRowMultiple(
    m: Matrix2D | Matrix,
    targetRow: number,
    sourceRow: number,
    scalar: number
  ): Matrix2D {
    const data = Matrix._ensure(m);
    const result = data.map((r) => [...r]);
    result[targetRow] = result[targetRow].map(
      (v, j) => v + scalar * result[sourceRow][j]
    );
    return result;
  }

  static ref(m: Matrix2D | Matrix): Matrix2D {
    let data = Matrix._ensure(m);
    const rows = data.length;
    const cols = data[0].length;
    let lead = 0;
    for (let r = 0; r < rows; r++) {
      if (lead >= cols) break;
      let i = r;
      while (Math.abs(data[i][lead]) < 1e-12) {
        i++;
        if (i === rows) {
          i = r;
          lead++;
          if (lead === cols) return Matrix._cleanZeros(data);
        }
      }
      if (i !== r) [data[i], data[r]] = [data[r], data[i]];
      const pivot = data[r][lead];
      data[r] = data[r].map((v) => v / pivot);
      for (let j = r + 1; j < rows; j++) {
        const factor = data[j][lead];
        data[j] = data[j].map((v, k) => v - factor * data[r][k]);
      }
      lead++;
    }
    return Matrix._cleanZeros(data);
  }

  static rref(m: Matrix2D | Matrix): Matrix2D {
    let data = Matrix._ensure(m);
    const rows = data.length;
    const cols = data[0].length;
    let lead = 0;
    for (let r = 0; r < rows; r++) {
      if (lead >= cols) break;
      let i = r;
      while (Math.abs(data[i][lead]) < 1e-12) {
        i++;
        if (i === rows) {
          i = r;
          lead++;
          if (lead === cols) return Matrix._cleanZeros(data);
        }
      }
      if (i !== r) [data[i], data[r]] = [data[r], data[i]];
      const pivot = data[r][lead];
      data[r] = data[r].map((v) => v / pivot);
      for (let j = 0; j < rows; j++) {
        if (j !== r) {
          const factor = data[j][lead];
          data[j] = data[j].map((v, k) => v - factor * data[r][k]);
        }
      }
      lead++;
    }
    return Matrix._cleanZeros(data);
  }

  // ═══════════════════════════════════════
  // DECOMPOSITIONS
  // ═══════════════════════════════════════

  static lu(m: Matrix2D | Matrix): LUResult {
    let data = Matrix._ensure(m);
    Matrix._assertSquare(data, "lu");
    const n = data.length;
    const L = Matrix.identity(n);
    const U = data.map((r) => [...r]);
    const P = Matrix.identity(n);

    for (let col = 0; col < n; col++) {
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(U[row][col]) > Math.abs(U[maxRow][col])) maxRow = row;
      }
      if (maxRow !== col) {
        [U[col], U[maxRow]] = [U[maxRow], U[col]];
        [P[col], P[maxRow]] = [P[maxRow], P[col]];
        for (let k = 0; k < col; k++) {
          [L[col][k], L[maxRow][k]] = [L[maxRow][k], L[col][k]];
        }
      }
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(U[col][col]) < 1e-12) continue;
        L[row][col] = U[row][col] / U[col][col];
        for (let j = col; j < n; j++) {
          U[row][j] -= L[row][col] * U[col][j];
        }
      }
    }
    return {
      L: Matrix._cleanZeros(L),
      U: Matrix._cleanZeros(U),
      P: Matrix._cleanZeros(P),
    };
  }

  static qr(m: Matrix2D | Matrix): QRResult {
    const data = Matrix._ensure(m);
    const rows = data.length;
    const cols = data[0].length;
    const Q: Matrix2D = Matrix.identity(rows);
    let R = data.map((r) => [...r]);

    for (let j = 0; j < Math.min(rows, cols); j++) {
      const x = Array.from({ length: rows - j }, (_, i) => R[i + j][j]);
      const norm = Math.sqrt(x.reduce((s, v) => s + v * v, 0));
      if (norm < 1e-12) continue;
      const u = [...x];
      u[0] += Math.sign(x[0] || 1) * norm;
      const uNorm = Math.sqrt(u.reduce((s, v) => s + v * v, 0));
      if (uNorm < 1e-12) continue;
      const v = u.map((val) => val / uNorm);

      for (let col = j; col < cols; col++) {
        const dot = v.reduce((s, vi, i) => s + vi * R[i + j][col], 0);
        for (let i = 0; i < rows - j; i++) {
          R[i + j][col] -= 2 * v[i] * dot;
        }
      }
      for (let col = 0; col < rows; col++) {
        const dot = v.reduce((s, vi, i) => s + vi * Q[i + j][col], 0);
        for (let i = 0; i < rows - j; i++) {
          Q[i + j][col] -= 2 * v[i] * dot;
        }
      }
    }
    return {
      Q: Matrix._cleanZeros(Matrix.transpose(Q)),
      R: Matrix._cleanZeros(R),
    };
  }

  static eigenvalues2x2(m: Matrix2D | Matrix): EigenvalueResult[] {
    const data = Matrix._ensure(m);
    Matrix._assertSquare(data, "eigenvalues2x2");
    if (data.length !== 2) {
      throw new RangeError("eigenvalues2x2 requires a 2×2 matrix");
    }
    const a = data[0][0],
      b = data[0][1];
    const c = data[1][0],
      d = data[1][1];
    const trace = a + d;
    const det = a * d - b * c;
    const discriminant = trace * trace - 4 * det;
    if (discriminant >= 0) {
      const sqrtD = Math.sqrt(discriminant);
      return [(trace + sqrtD) / 2, (trace - sqrtD) / 2];
    }
    const sqrtD = Math.sqrt(-discriminant);
    return [
      { real: trace / 2, imag: sqrtD / 2 },
      { real: trace / 2, imag: -sqrtD / 2 },
    ];
  }

  static eigenvalues(m: Matrix2D | Matrix): number[] {
    let data = Matrix._ensure(m);
    Matrix._assertSquare(data, "eigenvalues");
    const n = data.length;
    const maxIter = 1000;
    let A = data.map((r) => [...r]);

    for (let iter = 0; iter < maxIter; iter++) {
      const { Q, R } = Matrix.qr(A);
      A = Matrix.multiply(R, Q);
      let offDiag = 0;
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          if (i !== j) offDiag += A[i][j] * A[i][j];
        }
      }
      if (offDiag < 1e-20) break;
    }
    return Array.from({ length: n }, (_, i) =>
      Math.abs(A[i][i]) < 1e-10 ? 0 : A[i][i]
    );
  }

  // ═══════════════════════════════════════
  // SOLVING
  // ═══════════════════════════════════════

  static solve(A: Matrix2D | Matrix, b: Matrix2D | number[]): Matrix2D {
    let a = Matrix._ensure(A);
    Matrix._assertSquare(a, "solve");
    if (Math.abs(Matrix.determinant(a)) < 1e-10) {
      throw new Error("Matrix is singular; system has no unique solution");
    }
    const bArr: Matrix2D = Array.isArray(b[0])
      ? (b as Matrix2D).map((r) => [...r])
      : (b as number[]).map((v) => [v]);

    const n = a.length;
    const aug = a.map((row, i) => [...row, ...bArr[i]]);

    for (let col = 0; col < n; col++) {
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
      }
      if (maxRow !== col) [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
      if (Math.abs(aug[col][col]) < 1e-12) continue;
      const pivot = aug[col][col];
      for (let j = col; j <= n; j++) aug[col][j] /= pivot;
      for (let row = 0; row < n; row++) {
        if (row !== col) {
          const factor = aug[row][col];
          for (let j = col; j <= n; j++) aug[row][j] -= factor * aug[col][j];
        }
      }
    }
    return Array.from({ length: n }, (_, i) => [aug[i][n]]);
  }

  static solveCramer(A: Matrix2D | Matrix, b: Matrix2D | number[]): Matrix2D {
    let a = Matrix._ensure(A);
    Matrix._assertSquare(a, "solveCramer");
    const det = Matrix.determinant(a);
    if (Math.abs(det) < 1e-10) {
      throw new Error("Matrix is singular; Cramer's rule cannot be applied");
    }
    const bArr: number[] = Array.isArray(b[0])
      ? (b as Matrix2D).map((r) => r[0])
      : (b as number[]);
    const n = a.length;
    return Array.from({ length: n }, (_, i) => {
      const modified = a.map((row, r) =>
        row.map((v, c) => (c === i ? bArr[r] : v))
      );
      return [Matrix.determinant(modified) / det];
    });
  }

  // ═══════════════════════════════════════
  // STRUCTURE
  // ═══════════════════════════════════════

  static slice(
    m: Matrix2D | Matrix,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): Matrix2D {
    const data = Matrix._ensure(m);
    if (
      startRow < 0 ||
      endRow > data.length ||
      startCol < 0 ||
      endCol > data[0].length ||
      startRow >= endRow ||
      startCol >= endCol
    ) {
      throw new RangeError(
        `Invalid slice range rows[${startRow}:${endRow}], cols[${startCol}:${endCol}] ` +
          `for ${data.length}×${data[0].length} matrix`
      );
    }
    const result: Matrix2D = [];
    for (let i = startRow; i < endRow; i++) {
      result.push(data[i].slice(startCol, endCol));
    }
    return result;
  }

  static subMatrix(
    m: Matrix2D | Matrix,
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): Matrix2D {
    return Matrix.slice(m, startRow, startCol, endRow, endCol);
  }

  static hStack(a: Matrix2D | Matrix, b: Matrix2D | Matrix): Matrix2D {
    const ma = Matrix._ensure(a);
    const mb = Matrix._ensure(b);
    if (ma.length !== mb.length) {
      throw new RangeError(`Row count mismatch: ${ma.length} vs ${mb.length}`);
    }
    return ma.map((row, i) => [...row, ...mb[i]]);
  }

  static hConcat(a: Matrix2D | Matrix, b: Matrix2D | Matrix): Matrix2D {
    return Matrix.hStack(a, b);
  }

  static vStack(a: Matrix2D | Matrix, b: Matrix2D | Matrix): Matrix2D {
    const ma = Matrix._ensure(a);
    const mb = Matrix._ensure(b);
    if (ma[0].length !== mb[0].length) {
      throw new RangeError(
        `Column count mismatch: ${ma[0].length} vs ${mb[0].length}`
      );
    }
    return [...ma.map((r) => [...r]), ...mb.map((r) => [...r])];
  }

  static vConcat(a: Matrix2D | Matrix, b: Matrix2D | Matrix): Matrix2D {
    return Matrix.vStack(a, b);
  }

  static reshape(m: Matrix2D | Matrix, rows: number, cols: number): Matrix2D {
    const data = Matrix._ensure(m);
    const flat = Matrix.flatten(data);
    if (flat.length !== rows * cols) {
      throw new RangeError(
        `Cannot reshape ${data.length}×${data[0].length} (${flat.length} elements) ` +
          `to ${rows}×${cols} (${rows * cols} elements)`
      );
    }
    return Matrix.fromFlat(flat, rows, cols);
  }

  // ═══════════════════════════════════════
  // BOOLEAN CHECKS
  // ═══════════════════════════════════════

  static isSquare(m: Matrix2D | Matrix): boolean {
    const data = Matrix._ensure(m);
    return data.length === data[0].length;
  }

  static isIdentity(m: Matrix2D | Matrix): boolean {
    const data = Matrix._ensure(m);
    if (!Matrix.isSquare(data)) return false;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        if (Math.abs(data[i][j] - (i === j ? 1 : 0)) > 1e-10) return false;
      }
    }
    return true;
  }

  static isSymmetric(m: Matrix2D | Matrix): boolean {
    const data = Matrix._ensure(m);
    if (!Matrix.isSquare(data)) return false;
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data[0].length; j++) {
        if (Math.abs(data[i][j] - data[j][i]) > 1e-10) return false;
      }
    }
    return true;
  }

  static isDiagonal(m: Matrix2D | Matrix): boolean {
    const data = Matrix._ensure(m);
    if (!Matrix.isSquare(data)) return false;
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        if (i !== j && Math.abs(data[i][j]) > 1e-10) return false;
      }
    }
    return true;
  }

  static isUpperTriangular(m: Matrix2D | Matrix): boolean {
    const data = Matrix._ensure(m);
    if (!Matrix.isSquare(data)) return false;
    for (let i = 1; i < data.length; i++) {
      for (let j = 0; j < i; j++) {
        if (Math.abs(data[i][j]) > 1e-10) return false;
      }
    }
    return true;
  }

  static isLowerTriangular(m: Matrix2D | Matrix): boolean {
    const data = Matrix._ensure(m);
    if (!Matrix.isSquare(data)) return false;
    for (let i = 0; i < data.length; i++) {
      for (let j = i + 1; j < data[0].length; j++) {
        if (Math.abs(data[i][j]) > 1e-10) return false;
      }
    }
    return true;
  }

  static isOrthogonal(m: Matrix2D | Matrix, tolerance = 1e-8): boolean {
    const data = Matrix._ensure(m);
    if (!Matrix.isSquare(data)) return false;
    const product = Matrix.multiply(data, Matrix.transpose(data));
    for (let i = 0; i < product.length; i++) {
      for (let j = 0; j < product[0].length; j++) {
        const expected = i === j ? 1 : 0;
        if (Math.abs(product[i][j] - expected) > tolerance) return false;
      }
    }
    return true;
  }

  static isSingular(m: Matrix2D | Matrix): boolean {
    const data = Matrix._ensure(m);
    if (!Matrix.isSquare(data)) return false;
    return Math.abs(Matrix.determinant(data)) < 1e-10;
  }

  static isZero(m: Matrix2D | Matrix): boolean {
    return Matrix._ensure(m).every((row) =>
      row.every((v) => Math.abs(v) < 1e-10)
    );
  }

  static isVector(m: Matrix2D | Matrix): boolean {
    const data = Matrix._ensure(m);
    return data.length === 1 || data[0].length === 1;
  }

  static isRowVector(m: Matrix2D | Matrix): boolean {
    return Matrix._ensure(m).length === 1;
  }

  static isColumnVector(m: Matrix2D | Matrix): boolean {
    return Matrix._ensure(m)[0].length === 1;
  }

  static isSameShape(a: Matrix2D | Matrix, b: Matrix2D | Matrix): boolean {
    const ma = Matrix._ensure(a);
    const mb = Matrix._ensure(b);
    return ma.length === mb.length && ma[0].length === mb[0].length;
  }

  static equals(
    a: Matrix2D | Matrix,
    b: Matrix2D | Matrix,
    tolerance = 1e-10
  ): boolean {
    const ma = Matrix._ensure(a);
    const mb = Matrix._ensure(b);
    if (ma.length !== mb.length || ma[0].length !== mb[0].length) return false;
    for (let i = 0; i < ma.length; i++) {
      for (let j = 0; j < ma[0].length; j++) {
        if (Math.abs(ma[i][j] - mb[i][j]) > tolerance) return false;
      }
    }
    return true;
  }

  static isEqual(
    a: Matrix2D | Matrix,
    b: Matrix2D | Matrix,
    tolerance = 1e-10
  ): boolean {
    return Matrix.equals(a, b, tolerance);
  }

  // ═══════════════════════════════════════
  // VECTOR OPERATIONS
  // ═══════════════════════════════════════

  static dot(a: Matrix2D | number[], b: Matrix2D | number[]): number {
    const va = Array.isArray(a[0])
      ? Matrix.flatten(a as Matrix2D)
      : [...(a as number[])];
    const vb = Array.isArray(b[0])
      ? Matrix.flatten(b as Matrix2D)
      : [...(b as number[])];
    if (va.length !== vb.length) {
      throw new RangeError("Vectors must have same length for dot product");
    }
    return va.reduce((s, v, i) => s + v * vb[i], 0);
  }

  static cross(a: Matrix2D | number[], b: Matrix2D | number[]): number[] {
    const va = Array.isArray(a[0])
      ? Matrix.flatten(a as Matrix2D)
      : [...(a as number[])];
    const vb = Array.isArray(b[0])
      ? Matrix.flatten(b as Matrix2D)
      : [...(b as number[])];
    if (va.length !== 3 || vb.length !== 3) {
      throw new RangeError("Cross product requires 3D vectors");
    }
    return [
      va[1] * vb[2] - va[2] * vb[1],
      va[2] * vb[0] - va[0] * vb[2],
      va[0] * vb[1] - va[1] * vb[0],
    ];
  }

  static magnitude(v: Matrix2D | number[]): number {
    const flat = Array.isArray(v[0])
      ? Matrix.flatten(v as Matrix2D)
      : [...(v as number[])];
    return Math.sqrt(flat.reduce((s, x) => s + x * x, 0));
  }

  static normalize(v: Matrix2D | number[]): number[] {
    const flat = Array.isArray(v[0])
      ? Matrix.flatten(v as Matrix2D)
      : [...(v as number[])];
    const mag = Matrix.magnitude(flat);
    if (mag === 0) throw new Error("Cannot normalize zero vector");
    return flat.map((x) => x / mag);
  }

  static angleBetween(a: Matrix2D | number[], b: Matrix2D | number[]): number {
    const d = Matrix.dot(a, b);
    const m1 = Matrix.magnitude(a);
    const m2 = Matrix.magnitude(b);
    if (m1 === 0 || m2 === 0)
      throw new Error("Cannot find angle with zero vector");
    return Math.acos(Math.max(-1, Math.min(1, d / (m1 * m2))));
  }

  // ═══════════════════════════════════════
  // AGGREGATION BY ROW / COLUMN
  // ═══════════════════════════════════════

  static rowSums(m: Matrix2D | Matrix): Matrix2D {
    return Matrix._ensure(m).map((row) => [row.reduce((a, b) => a + b, 0)]);
  }

  static colSums(m: Matrix2D | Matrix): Matrix2D {
    const data = Matrix._ensure(m);
    return [
      Array.from({ length: data[0].length }, (_, j) =>
        data.reduce((s, row) => s + row[j], 0)
      ),
    ];
  }

  static rowMeans(m: Matrix2D | Matrix): Matrix2D {
    return Matrix._ensure(m).map((row) => [
      row.reduce((a, b) => a + b, 0) / row.length,
    ]);
  }

  static colMeans(m: Matrix2D | Matrix): Matrix2D {
    const data = Matrix._ensure(m);
    return [
      Array.from(
        { length: data[0].length },
        (_, j) => data.reduce((s, row) => s + row[j], 0) / data.length
      ),
    ];
  }

  // ═══════════════════════════════════════
  // FUNCTIONAL / ELEMENT-WISE
  // ═══════════════════════════════════════

  static map(
    m: Matrix2D | Matrix,
    fn: (val: number, i: number, j: number) => number
  ): Matrix2D {
    return Matrix._ensure(m).map((row, i) =>
      row.map((val, j) => fn(val, i, j))
    );
  }

  static forEach(
    m: Matrix2D | Matrix,
    fn: (val: number, i: number, j: number) => void
  ): void {
    const data = Matrix._ensure(m);
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        fn(data[i][j], i, j);
      }
    }
  }

  static every(
    m: Matrix2D | Matrix,
    fn: (val: number, i: number, j: number) => boolean
  ): boolean {
    const data = Matrix._ensure(m);
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        if (!fn(data[i][j], i, j)) return false;
      }
    }
    return true;
  }

  static some(
    m: Matrix2D | Matrix,
    fn: (val: number, i: number, j: number) => boolean
  ): boolean {
    const data = Matrix._ensure(m);
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < data[0].length; j++) {
        if (fn(data[i][j], i, j)) return true;
      }
    }
    return false;
  }

  static round(m: Matrix2D | Matrix, decimals = 0): Matrix2D {
    const p = Math.pow(10, decimals);
    return Matrix.map(m, (v) => Math.round(v * p) / p);
  }

  static abs(m: Matrix2D | Matrix): Matrix2D {
    return Matrix.map(m, (v) => Math.abs(v));
  }

  // ═══════════════════════════════════════
  // DISPLAY / UTILITY
  // ═══════════════════════════════════════

  static toString(m: Matrix2D | Matrix, decimals = 4): string {
    const data = Matrix._ensure(m);
    const formatted = data.map((row) =>
      row.map((v) => (Number.isInteger(v) ? v.toString() : v.toFixed(decimals)))
    );
    const widths = Array.from({ length: data[0].length }, (_, j) =>
      Math.max(...formatted.map((r) => r[j].length))
    );
    return formatted
      .map((row, i) => {
        const cells = row.map((v, j) => v.padStart(widths[j])).join("  ");
        if (data.length === 1) return `[ ${cells} ]`;
        if (i === 0) return `┌ ${cells} ┐`;
        if (i === data.length - 1) return `└ ${cells} ┘`;
        return `│ ${cells} │`;
      })
      .join("\n");
  }

  static print(m: Matrix2D | Matrix, decimals = 4): void {
    console.log(Matrix.toString(m, decimals));
  }

  static toHTML(m: Matrix2D | Matrix, className = "matrix"): string {
    const data = Matrix._ensure(m);
    let html = `<table class="${className}">`;
    for (const row of data) {
      html += "<tr>";
      for (const v of row) html += `<td>${v}</td>`;
      html += "</tr>";
    }
    return html + "</table>";
  }

  static toJSON(m: Matrix2D | Matrix): {
    rows: number;
    cols: number;
    data: Matrix2D;
  } {
    const data = Matrix._ensure(m);
    return {
      rows: data.length,
      cols: data[0].length,
      data: Matrix.clone(data),
    };
  }

  // ═══════════════════════════════════════════
  // INSTANCE API — chainable, .toArray() → 2D
  // ═══════════════════════════════════════════

  toArray(): Matrix2D {
    return this._data.map((r) => [...r]);
  }

  getRows(): number {
    return this._rows;
  }
  getCols(): number {
    return this._cols;
  }
  getShape(): [number, number] {
    return [this._rows, this._cols];
  }
  getSize(): number {
    return this._rows * this._cols;
  }
  getElement(row: number, col: number): number {
    return Matrix.get(this._data, row, col);
  }

  // Chainable arithmetic → return new Matrix
  add(other: Matrix2D | Matrix): Matrix {
    return new Matrix(Matrix.add(this._data, other));
  }
  subtract(other: Matrix2D | Matrix): Matrix {
    return new Matrix(Matrix.subtract(this._data, other));
  }
  multiply(other: Matrix2D | Matrix): Matrix {
    return new Matrix(Matrix.multiply(this._data, other));
  }
  scale(scalar: number): Matrix {
    return new Matrix(Matrix.scale(this._data, scalar));
  }
  negate(): Matrix {
    return new Matrix(Matrix.negate(this._data));
  }
  hadamard(other: Matrix2D | Matrix): Matrix {
    return new Matrix(Matrix.hadamard(this._data, other));
  }
  elementDivide(other: Matrix2D | Matrix): Matrix {
    return new Matrix(Matrix.elementDivide(this._data, other));
  }
  power(n: number): Matrix {
    return new Matrix(Matrix.power(this._data, n));
  }
  scalarAdd(s: number): Matrix {
    return new Matrix(Matrix.scalarAdd(this._data, s));
  }
  scalarSubtract(s: number): Matrix {
    return new Matrix(Matrix.scalarSubtract(this._data, s));
  }
  elementPower(exp: number): Matrix {
    return new Matrix(Matrix.elementPower(this._data, exp));
  }

  // Chainable transforms
  transpose(): Matrix {
    return new Matrix(Matrix.transpose(this._data));
  }
  rref(): Matrix {
    return new Matrix(Matrix.rref(this._data));
  }
  ref(): Matrix {
    return new Matrix(Matrix.ref(this._data));
  }

  inverse(): Matrix {
    return new Matrix(Matrix.inverse(this._data));
  }

  adjugate(): Matrix {
    return new Matrix(Matrix.adjugate(this._data));
  }

  // Chainable structure
  hStack(other: Matrix2D | Matrix): Matrix {
    return new Matrix(Matrix.hStack(this._data, other));
  }
  vStack(other: Matrix2D | Matrix): Matrix {
    return new Matrix(Matrix.vStack(this._data, other));
  }

  slice(
    startRow: number,
    startCol: number,
    endRow: number,
    endCol: number
  ): Matrix {
    return new Matrix(
      Matrix.slice(this._data, startRow, startCol, endRow, endCol)
    );
  }

  reshape(rows: number, cols: number): Matrix {
    return new Matrix(Matrix.reshape(this._data, rows, cols));
  }
  swapRows(r1: number, r2: number): Matrix {
    return new Matrix(Matrix.swapRows(this._data, r1, r2));
  }
  swapCols(c1: number, c2: number): Matrix {
    return new Matrix(Matrix.swapCols(this._data, c1, c2));
  }

  // Chainable functional
  map(fn: (val: number, i: number, j: number) => number): Matrix {
    return new Matrix(Matrix.map(this._data, fn));
  }
  round(d?: number): Matrix {
    return new Matrix(Matrix.round(this._data, d));
  }
  abs(): Matrix {
    return new Matrix(Matrix.abs(this._data));
  }

  // Terminal → scalar
  determinant(): number {
    return Matrix.determinant(this._data);
  }
  trace(): number {
    return Matrix.trace(this._data);
  }
  sum(): number {
    return Matrix.sum(this._data);
  }
  min(): number {
    return Matrix.min(this._data);
  }
  max(): number {
    return Matrix.max(this._data);
  }
  mean(): number {
    return Matrix.mean(this._data);
  }
  rank(): number {
    return Matrix.rank(this._data);
  }
  normFrobenius(): number {
    return Matrix.normFrobenius(this._data);
  }
  norm(): number {
    return Matrix.norm(this._data);
  }
  eigenvalues(): number[] {
    return Matrix.eigenvalues(this._data);
  }
  flatten(): number[] {
    return Matrix.flatten(this._data);
  }
  getDiagonal(): number[] {
    return Matrix.getDiagonal(this._data);
  }

  // Terminal → boolean
  isSquare(): boolean {
    return Matrix.isSquare(this._data);
  }
  isIdentity(): boolean {
    return Matrix.isIdentity(this._data);
  }
  isSymmetric(): boolean {
    return Matrix.isSymmetric(this._data);
  }
  isDiagonal(): boolean {
    return Matrix.isDiagonal(this._data);
  }
  isUpperTriangular(): boolean {
    return Matrix.isUpperTriangular(this._data);
  }
  isLowerTriangular(): boolean {
    return Matrix.isLowerTriangular(this._data);
  }
  isOrthogonal(tolerance?: number): boolean {
    return Matrix.isOrthogonal(this._data, tolerance);
  }
  isSingular(): boolean {
    return Matrix.isSingular(this._data);
  }
  isZero(): boolean {
    return Matrix.isZero(this._data);
  }

  equals(other: Matrix2D | Matrix, tol?: number): boolean {
    const b = other instanceof Matrix ? other._data : other;
    return Matrix.equals(this._data, b, tol);
  }

  isEqual(other: Matrix2D | Matrix, tol?: number): boolean {
    return this.equals(other, tol);
  }

  toString(d?: number): string {
    return Matrix.toString(this._data, d);
  }
  print(d?: number): this {
    Matrix.print(this._data, d);
    return this;
  }
  clone(): Matrix {
    return new Matrix(Matrix.clone(this._data));
  }

  solve(b: Matrix2D | number[] | Matrix): Matrix {
    const bArr = b instanceof Matrix ? b._data : b;
    return new Matrix(Matrix.solve(this._data, bArr));
  }

  lu(): LUResult {
    return Matrix.lu(this._data);
  }
  qr(): QRResult {
    return Matrix.qr(this._data);
  }
}

export default Matrix;
