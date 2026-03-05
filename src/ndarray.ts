// =====================================================================
// NDArray — NumPy-inspired N-dimensional array for NumWiz
// =====================================================================

export type Shape = ReadonlyArray<number>;
export type MutableShape = number[];

// Slice: null = all, number = single index (dim dropped), tuple = [start?, stop?, step?]
export type SliceArg =
  | null
  | number
  | [number | undefined, number | undefined, (number | undefined)?];

// ----------------------------------------------------------------
// Internal helpers
// ----------------------------------------------------------------

function computeSize(shape: Shape): number {
  return shape.length === 0
    ? 1
    : (shape as number[]).reduce((a, b) => a * b, 1);
}

function computeCStrides(shape: Shape): number[] {
  const n = shape.length;
  const strides = new Array<number>(n);
  let prod = 1;
  for (let i = n - 1; i >= 0; i--) {
    strides[i] = prod;
    prod *= shape[i];
  }
  return strides;
}

function flatToMulti(flat: number, shape: Shape): number[] {
  const ndim = shape.length;
  const idx = new Array<number>(ndim);
  for (let i = ndim - 1; i >= 0; i--) {
    idx[i] = flat % shape[i];
    flat = Math.floor(flat / shape[i]);
  }
  return idx;
}

function broadcastShapes(s1: Shape, s2: Shape): number[] {
  const ndim = Math.max(s1.length, s2.length);
  const out: number[] = new Array(ndim);
  for (let i = 0; i < ndim; i++) {
    const d1 = i < ndim - s1.length ? 1 : s1[i - (ndim - s1.length)];
    const d2 = i < ndim - s2.length ? 1 : s2[i - (ndim - s2.length)];
    if (d1 !== d2 && d1 !== 1 && d2 !== 1) {
      throw new RangeError(
        `Shapes [${Array.from(s1)}] and [${Array.from(
          s2
        )}] are not broadcast-compatible`
      );
    }
    out[i] = Math.max(d1, d2);
  }
  return out;
}

function broadcastIndex(outIdx: number[], sourceShape: Shape): number[] {
  const ndim = outIdx.length;
  const offset = ndim - sourceShape.length;
  return Array.from({ length: sourceShape.length }, (_, i) => {
    const d = sourceShape[i];
    return d === 1 ? 0 : outIdx[i + offset];
  });
}

function resolveSlice(
  spec: number | undefined,
  N: number,
  defaultVal: number
): number {
  if (spec === undefined) return defaultVal;
  const v = spec < 0 ? spec + N : spec;
  return Math.max(0, Math.min(v, N));
}

// ----------------------------------------------------------------
// NDArray class
// ----------------------------------------------------------------

export class NDArray {
  /** @internal */ _data: Float64Array;
  /** @internal */ _shape: number[];
  /** @internal */ _strides: number[];
  /** @internal */ _offset: number;

  constructor(
    data: Float64Array | number[],
    shape: number[],
    strides?: number[],
    offset = 0
  ) {
    this._data = data instanceof Float64Array ? data : new Float64Array(data);
    this._shape = shape.slice();
    this._strides = strides ? strides.slice() : computeCStrides(shape);
    this._offset = offset;
  }

  // ----------------------
  // Properties
  // ----------------------

  get shape(): number[] {
    return this._shape.slice();
  }

  get ndim(): number {
    return this._shape.length;
  }

  get size(): number {
    return computeSize(this._shape);
  }

  get dtype(): string {
    return "float64";
  }

  get T(): NDArray {
    return this.transpose();
  }

  // ----------------------
  // Index computation
  // ----------------------

  private _flatIndex(indices: number[]): number {
    if (indices.length !== this._shape.length) {
      throw new RangeError(
        `Expected ${this._shape.length} indices, got ${indices.length}`
      );
    }
    let idx = this._offset;
    for (let i = 0; i < indices.length; i++) {
      let ix = indices[i];
      if (ix < 0) ix += this._shape[i];
      if (ix < 0 || ix >= this._shape[i]) {
        throw new RangeError(
          `Index ${indices[i]} out of bounds for axis ${i} with size ${this._shape[i]}`
        );
      }
      idx += ix * this._strides[i];
    }
    return idx;
  }

  // ----------------------
  // Element access
  // ----------------------

  get(...indices: number[]): number {
    return this._data[this._flatIndex(indices)];
  }

  set(value: number, ...indices: number[]): this {
    this._data[this._flatIndex(indices)] = value;
    return this;
  }

  /** Flat 0-based index access (C-order). Negative indices wrap around. */
  item(i: number): number {
    if (i < 0) i += this.size;
    return this.get(...flatToMulti(i, this._shape));
  }

  // ----------------------
  // Materialise in C-order
  // ----------------------

  private _iterData(): Float64Array {
    const sz = this.size;
    const out = new Float64Array(sz);
    for (let i = 0; i < sz; i++) {
      out[i] = this.item(i);
    }
    return out;
  }

  /** Return a contiguous copy of this array. */
  copy(): NDArray {
    return new NDArray(this._iterData(), this._shape.slice());
  }

  // ----------------------
  // Shape operations
  // ----------------------

  reshape(newShape: number[]): NDArray {
    // Allow one -1 dimension
    const negIdx = newShape.indexOf(-1);
    if (negIdx !== -1) {
      const knownSize = newShape
        .filter((d) => d !== -1)
        .reduce((a, b) => a * b, 1);
      if (this.size % knownSize !== 0) {
        throw new RangeError(
          `Cannot reshape array of size ${this.size} with shape containing -1`
        );
      }
      newShape = newShape.slice();
      newShape[negIdx] = this.size / knownSize;
    }
    if (computeSize(newShape) !== this.size) {
      throw new RangeError(
        `Cannot reshape array of size ${this.size} into shape [${newShape}]`
      );
    }
    return new NDArray(this._iterData(), newShape);
  }

  flatten(): NDArray {
    return new NDArray(this._iterData(), [this.size]);
  }

  ravel(): NDArray {
    return this.flatten();
  }

  squeeze(axis?: number): NDArray {
    let newShape: number[];
    if (axis !== undefined) {
      if (this._shape[axis] !== 1) {
        throw new RangeError(
          `Cannot squeeze axis of size ${this._shape[axis]}`
        );
      }
      newShape = this._shape.filter((_, i) => i !== axis);
    } else {
      newShape = this._shape.filter((s) => s !== 1);
      if (newShape.length === 0) newShape = [1];
    }
    return this.reshape(newShape);
  }

  expandDims(axis: number): NDArray {
    const sh = this._shape.slice();
    if (axis < 0) axis += sh.length + 1;
    sh.splice(axis, 0, 1);
    return this.reshape(sh);
  }

  transpose(axes?: number[]): NDArray {
    const n = this.ndim;
    if (!axes) {
      axes = Array.from({ length: n }, (_, i) => n - 1 - i);
    }
    if (axes.length !== n) {
      throw new RangeError(`axes must have same length as ndim`);
    }
    const newShape = axes.map((a) => this._shape[a]);
    const newStrides = axes.map((a) => this._strides[a]);
    return new NDArray(this._data, newShape, newStrides, this._offset);
  }

  swapaxes(a1: number, a2: number): NDArray {
    const axes = Array.from({ length: this.ndim }, (_, i) => i);
    [axes[a1], axes[a2]] = [axes[a2], axes[a1]];
    return this.transpose(axes);
  }

  // ----------------------
  // Slicing
  // ----------------------

  /** Python-style slicing. Pass null for "take all", a number for single-index, or [start?, stop?, step?]. */
  slice(...args: SliceArg[]): NDArray {
    while (args.length < this.ndim) args.push(null);
    if (args.length > this.ndim) {
      throw new RangeError(`Too many slice arguments for ${this.ndim}D array`);
    }

    let newOffset = this._offset;
    const newShape: number[] = [];
    const newStrides: number[] = [];

    for (let dim = 0; dim < this.ndim; dim++) {
      const spec = args[dim];
      const N = this._shape[dim];
      const stride = this._strides[dim];

      if (spec === null) {
        newShape.push(N);
        newStrides.push(stride);
      } else if (typeof spec === "number") {
        let idx = spec < 0 ? spec + N : spec;
        if (idx < 0 || idx >= N) {
          throw new RangeError(
            `Index ${spec} out of bounds for axis ${dim} with size ${N}`
          );
        }
        newOffset += idx * stride;
        // dimension dropped
      } else {
        const step = spec[2] ?? 1;
        if (step === 0) throw new RangeError(`Slice step cannot be zero`);

        let start: number, stop: number;
        if (step > 0) {
          start = resolveSlice(spec[0], N, 0);
          stop = resolveSlice(spec[1], N, N);
        } else {
          // For negative step
          const rawStart = spec[0] !== undefined ? spec[0] : N - 1;
          const rawStop = spec[1];
          start =
            rawStart < 0
              ? Math.max(-1, rawStart + N)
              : Math.min(rawStart, N - 1);
          stop =
            rawStop === undefined
              ? -N - 1 // sentinel: before index 0
              : rawStop < 0
              ? rawStop + N
              : Math.min(rawStop, N - 1);
        }

        const sliceLen = Math.max(0, Math.ceil((stop - start) / step));
        if (sliceLen > 0) {
          newOffset += start * stride;
        }
        newShape.push(sliceLen);
        newStrides.push(stride * step);
      }
    }

    return new NDArray(this._data, newShape, newStrides, newOffset);
  }

  // ----------------------
  // Broadcasting helper
  // ----------------------

  private _applyBinaryOp(
    other: NDArray | number,
    fn: (a: number, b: number) => number
  ): NDArray {
    if (typeof other === "number") {
      const data = this._iterData();
      const out = new Float64Array(data.length);
      for (let i = 0; i < data.length; i++) out[i] = fn(data[i], other);
      return new NDArray(out, this._shape.slice());
    }

    const outShape = broadcastShapes(this._shape, other._shape);
    const outSize = computeSize(outShape);
    const out = new Float64Array(outSize);

    for (let i = 0; i < outSize; i++) {
      const outIdx = flatToMulti(i, outShape);
      const idxA = broadcastIndex(outIdx, this._shape);
      const idxB = broadcastIndex(outIdx, other._shape);
      out[i] = fn(this.get(...idxA), other.get(...idxB));
    }

    return new NDArray(out, outShape);
  }

  // ----------------------
  // Arithmetic
  // ----------------------

  add(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => a + b);
  }

  subtract(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => a - b);
  }

  multiply(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => a * b);
  }

  divide(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => {
      if (b === 0) throw new Error(`Division by zero`);
      return a / b;
    });
  }

  safeDivide(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => (b === 0 ? NaN : a / b));
  }

  modulo(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => a % b);
  }

  power(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => Math.pow(a, b));
  }

  maximum(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => Math.max(a, b));
  }

  minimum(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => Math.min(a, b));
  }

  negative(): NDArray {
    return this._applyUnaryOp((x) => -x);
  }

  // ----------------------
  // Unary math
  // ----------------------

  private _applyUnaryOp(fn: (x: number) => number): NDArray {
    const data = this._iterData();
    const out = new Float64Array(data.length);
    for (let i = 0; i < data.length; i++) out[i] = fn(data[i]);
    return new NDArray(out, this._shape.slice());
  }

  abs(): NDArray {
    return this._applyUnaryOp(Math.abs);
  }
  sqrt(): NDArray {
    return this._applyUnaryOp(Math.sqrt);
  }
  cbrt(): NDArray {
    return this._applyUnaryOp(Math.cbrt);
  }
  exp(): NDArray {
    return this._applyUnaryOp(Math.exp);
  }
  exp2(): NDArray {
    return this._applyUnaryOp((x) => Math.pow(2, x));
  }
  log(): NDArray {
    return this._applyUnaryOp(Math.log);
  }
  log2(): NDArray {
    return this._applyUnaryOp(Math.log2);
  }
  log10(): NDArray {
    return this._applyUnaryOp(Math.log10);
  }
  log1p(): NDArray {
    return this._applyUnaryOp(Math.log1p);
  }
  expm1(): NDArray {
    return this._applyUnaryOp(Math.expm1);
  }
  sin(): NDArray {
    return this._applyUnaryOp(Math.sin);
  }
  cos(): NDArray {
    return this._applyUnaryOp(Math.cos);
  }
  tan(): NDArray {
    return this._applyUnaryOp(Math.tan);
  }
  asin(): NDArray {
    return this._applyUnaryOp(Math.asin);
  }
  acos(): NDArray {
    return this._applyUnaryOp(Math.acos);
  }
  atan(): NDArray {
    return this._applyUnaryOp(Math.atan);
  }
  sinh(): NDArray {
    return this._applyUnaryOp(Math.sinh);
  }
  cosh(): NDArray {
    return this._applyUnaryOp(Math.cosh);
  }
  tanh(): NDArray {
    return this._applyUnaryOp(Math.tanh);
  }
  floor(): NDArray {
    return this._applyUnaryOp(Math.floor);
  }
  ceil(): NDArray {
    return this._applyUnaryOp(Math.ceil);
  }
  round(): NDArray {
    return this._applyUnaryOp(Math.round);
  }
  trunc(): NDArray {
    return this._applyUnaryOp(Math.trunc);
  }
  sign(): NDArray {
    return this._applyUnaryOp(Math.sign);
  }
  reciprocal(): NDArray {
    return this._applyUnaryOp((x) => 1 / x);
  }
  square(): NDArray {
    return this._applyUnaryOp((x) => x * x);
  }
  negate(): NDArray {
    return this.negative();
  }

  /** Clip values to [min, max] range. */
  clip(min = -Infinity, max = Infinity): NDArray {
    return this._applyUnaryOp((x) => Math.max(min, Math.min(max, x)));
  }

  /** Element-wise isNaN check → 1.0 or 0.0. */
  isNaN(): NDArray {
    return this._applyUnaryOp((x) => (Number.isNaN(x) ? 1 : 0));
  }

  /** Element-wise isFinite check → 1.0 or 0.0. */
  isFinite(): NDArray {
    return this._applyUnaryOp((x) => (Number.isFinite(x) ? 1 : 0));
  }

  // ----------------------
  // Comparison (element-wise)
  // ----------------------

  equal(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => (a === b ? 1 : 0));
  }

  notEqual(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => (a !== b ? 1 : 0));
  }

  greater(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => (a > b ? 1 : 0));
  }

  greaterEqual(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => (a >= b ? 1 : 0));
  }

  less(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => (a < b ? 1 : 0));
  }

  lessEqual(other: NDArray | number): NDArray {
    return this._applyBinaryOp(other, (a, b) => (a <= b ? 1 : 0));
  }

  // ----------------------
  // Reduction operations
  // ----------------------

  private _reduce(
    fn: (acc: number, val: number) => number,
    init: number | null,
    axis?: number
  ): NDArray | number {
    if (axis === undefined) {
      // Reduce all elements
      const data = this._iterData();
      let acc = init !== null ? init : data[0];
      const start = init !== null ? 0 : 1;
      for (let i = start; i < data.length; i++) {
        acc = fn(acc, data[i]);
      }
      return acc;
    }

    if (axis < 0) axis += this.ndim;
    if (axis < 0 || axis >= this.ndim) {
      throw new RangeError(
        `Axis ${axis} out of bounds for ${this.ndim}D array`
      );
    }

    const outShape = this._shape.filter((_, i) => i !== axis);
    const outSize = computeSize(outShape.length === 0 ? [1] : outShape);
    const outData = new Float64Array(outSize);
    const outInit = new Uint8Array(outSize); // whether init has been set

    const sz = this.size;
    for (let flatIn = 0; flatIn < sz; flatIn++) {
      const multiIn = flatToMulti(flatIn, this._shape);
      const multiOut = multiIn.filter((_, i) => i !== axis);
      // Compute flat output index
      const outIdxShape = outShape.length === 0 ? [1] : outShape;
      let flatOut = 0;
      for (let i = 0; i < outIdxShape.length; i++) {
        flatOut = flatOut * outIdxShape[i] + multiOut[i];
      }
      const val = this.item(flatIn);
      if (!outInit[flatOut]) {
        outData[flatOut] = init !== null ? fn(init, val) : val;
        outInit[flatOut] = 1;
      } else {
        outData[flatOut] = fn(outData[flatOut], val);
      }
    }

    const finalShape = outShape.length === 0 ? [1] : outShape;
    return new NDArray(outData, finalShape);
  }

  sum(axis?: number): NDArray | number {
    return this._reduce((a, b) => a + b, 0, axis);
  }

  product(axis?: number): NDArray | number {
    return this._reduce((a, b) => a * b, 1, axis);
  }

  min(axis?: number): NDArray | number {
    return this._reduce((a, b) => Math.min(a, b), null, axis);
  }

  max(axis?: number): NDArray | number {
    return this._reduce((a, b) => Math.max(a, b), null, axis);
  }

  mean(axis?: number): NDArray | number {
    if (axis === undefined) {
      return (this.sum() as number) / this.size;
    }
    const s = this.sum(axis) as NDArray;
    const n = this._shape[axis < 0 ? axis + this.ndim : axis];
    return s.divide(n);
  }

  variance(axis?: number, ddof = 0): NDArray | number {
    const m = this.mean(axis);
    if (axis === undefined) {
      const data = this._iterData();
      const mu = m as number;
      let v = 0;
      for (let i = 0; i < data.length; i++) v += (data[i] - mu) ** 2;
      return v / (data.length - ddof);
    }
    const mu = m as NDArray;
    const diff = this.subtract(
      mu.expandDims(axis < 0 ? axis + this.ndim : axis)
    );
    const sq = diff.power(2);
    const s = sq.sum(axis) as NDArray;
    const n = this._shape[axis < 0 ? axis + this.ndim : axis] - ddof;
    return s.divide(n);
  }

  std(axis?: number, ddof = 0): NDArray | number {
    const v = this.variance(axis, ddof);
    if (typeof v === "number") return Math.sqrt(v);
    return (v as NDArray).sqrt();
  }

  // ----------------------
  // argmin / argmax
  // ----------------------

  argmin(axis?: number): NDArray | number {
    if (axis === undefined) {
      const data = this._iterData();
      let minVal = data[0],
        minIdx = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i] < minVal) {
          minVal = data[i];
          minIdx = i;
        }
      }
      return minIdx;
    }
    return this._argReduceAxis(axis, (a, b) => b < a);
  }

  argmax(axis?: number): NDArray | number {
    if (axis === undefined) {
      const data = this._iterData();
      let maxVal = data[0],
        maxIdx = 0;
      for (let i = 1; i < data.length; i++) {
        if (data[i] > maxVal) {
          maxVal = data[i];
          maxIdx = i;
        }
      }
      return maxIdx;
    }
    return this._argReduceAxis(axis, (a, b) => b > a);
  }

  private _argReduceAxis(
    axis: number,
    isBetter: (cur: number, cand: number) => boolean
  ): NDArray {
    if (axis < 0) axis += this.ndim;
    const outShape = this._shape.filter((_, i) => i !== axis);
    const outSize = computeSize(outShape.length === 0 ? [1] : outShape);
    const outData = new Float64Array(outSize);
    const outVal = new Float64Array(outSize).fill(NaN);
    const outInit = new Uint8Array(outSize);

    const axisLen = this._shape[axis];
    const sz = this.size;
    const outFinalShape = outShape.length === 0 ? [1] : outShape;

    for (let flatIn = 0; flatIn < sz; flatIn++) {
      const multiIn = flatToMulti(flatIn, this._shape);
      const axisIdx = multiIn[axis];
      const multiOut = multiIn.filter((_, i) => i !== axis);
      let flatOut = 0;
      for (let i = 0; i < outFinalShape.length; i++) {
        flatOut = flatOut * outFinalShape[i] + multiOut[i];
      }
      const val = this.item(flatIn);
      if (!outInit[flatOut] || isBetter(outVal[flatOut], val)) {
        outVal[flatOut] = val;
        outData[flatOut] = axisIdx;
        outInit[flatOut] = 1;
      }
    }
    void axisLen;
    return new NDArray(outData, outFinalShape);
  }

  // ----------------------
  // Boolean reductions
  // ----------------------

  any(): boolean {
    const data = this._iterData();
    for (let i = 0; i < data.length; i++) if (data[i] !== 0) return true;
    return false;
  }

  all(): boolean {
    const data = this._iterData();
    for (let i = 0; i < data.length; i++) if (data[i] === 0) return false;
    return true;
  }

  nonzero(): NDArray[] {
    const indices: number[][] = Array.from({ length: this.ndim }, () => []);
    const sz = this.size;
    for (let i = 0; i < sz; i++) {
      if (this.item(i) !== 0) {
        const multi = flatToMulti(i, this._shape);
        multi.forEach((idx, dim) => indices[dim].push(idx));
      }
    }
    return indices.map((idxArr) => NDArray.from(idxArr));
  }

  /** Conditional selection: returns values from `x` where this==1, else from `y`. */
  where(x: NDArray | number, y: NDArray | number): NDArray {
    const xArr = typeof x === "number" ? NDArray.full(this._shape, x) : x;
    const yArr = typeof y === "number" ? NDArray.full(this._shape, y) : y;
    const sz = this.size;
    const outData = new Float64Array(sz);
    for (let i = 0; i < sz; i++) {
      outData[i] = this.item(i) !== 0 ? xArr.item(i) : yArr.item(i);
    }
    return new NDArray(outData, this._shape.slice());
  }

  // ----------------------
  // Sorting
  // ----------------------

  sort(axis = -1): NDArray {
    if (axis < 0) axis += this.ndim;
    if (this.ndim === 1 || axis === this.ndim - 1) {
      const data = this._iterData();
      // Sort along last axis (groups of axisLen)
      const axisLen = this._shape[axis];
      const numVec = data.length / axisLen;
      const out = new Float64Array(data.length);
      for (let v = 0; v < numVec; v++) {
        const seg = Array.from(data.subarray(v * axisLen, (v + 1) * axisLen));
        seg.sort((a, b) => a - b);
        for (let i = 0; i < seg.length; i++) out[v * axisLen + i] = seg[i];
      }
      return new NDArray(out, this._shape.slice());
    }
    // Generic axis sort: swapaxes → sort along last → swapaxes back
    return this.swapaxes(axis, this.ndim - 1)
      .sort(this.ndim - 1)
      .swapaxes(axis, this.ndim - 1);
  }

  argsort(axis = -1): NDArray {
    if (axis < 0) axis += this.ndim;
    const axisLen = this._shape[axis < 0 ? axis + this.ndim : axis];
    const data = this._iterData();
    const numVec = data.length / axisLen;
    const out = new Float64Array(data.length);
    for (let v = 0; v < numVec; v++) {
      const start = v * axisLen;
      const indices = Array.from({ length: axisLen }, (_, i) => i);
      indices.sort((a, b) => data[start + a] - data[start + b]);
      for (let i = 0; i < axisLen; i++) out[start + i] = indices[i];
    }
    return new NDArray(out, this._shape.slice());
  }

  unique(): { values: NDArray; indices: NDArray; counts: NDArray } {
    const data = this._iterData();
    const counts = new Map<number, number>();
    const firstIdx = new Map<number, number>();
    for (let i = 0; i < data.length; i++) {
      const v = data[i];
      counts.set(v, (counts.get(v) ?? 0) + 1);
      if (!firstIdx.has(v)) firstIdx.set(v, i);
    }
    const sorted = Array.from(counts.keys()).sort((a, b) => a - b);
    return {
      values: NDArray.from(sorted),
      indices: NDArray.from(sorted.map((v) => firstIdx.get(v)!)),
      counts: NDArray.from(sorted.map((v) => counts.get(v)!)),
    };
  }

  // ----------------------
  // Matrix operations (2D)
  // ----------------------

  dot(other: NDArray): NDArray {
    if (this.ndim === 1 && other.ndim === 1) {
      // inner product
      if (this._shape[0] !== other._shape[0]) {
        throw new RangeError(
          `Dot product dimension mismatch: ${this._shape[0]} vs ${other._shape[0]}`
        );
      }
      let sum = 0;
      for (let i = 0; i < this._shape[0]; i++)
        sum += this.get(i) * other.get(i);
      return NDArray.from([sum]);
    }
    if (this.ndim === 2 && other.ndim === 1) {
      return this.matmul(other.reshape([other._shape[0], 1])).squeeze(1);
    }
    if (this.ndim === 1 && other.ndim === 2) {
      return this.reshape([1, this._shape[0]]).matmul(other).squeeze(0);
    }
    return this.matmul(other);
  }

  matmul(other: NDArray): NDArray {
    if (this.ndim !== 2 || other.ndim !== 2) {
      throw new RangeError(`matmul requires 2D arrays`);
    }
    const [m, k1] = this._shape;
    const [k2, n] = other._shape;
    if (k1 !== k2) {
      throw new RangeError(
        `Matrix multiply: shapes [${m},${k1}] and [${k2},${n}] are incompatible`
      );
    }
    const out = new Float64Array(m * n);
    for (let i = 0; i < m; i++) {
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let k = 0; k < k1; k++) s += this.get(i, k) * other.get(k, j);
        out[i * n + j] = s;
      }
    }
    return new NDArray(out, [m, n]);
  }

  /** Trace of 2D matrix. */
  trace(): number {
    if (this.ndim !== 2) throw new RangeError(`trace requires 2D array`);
    const n = Math.min(this._shape[0], this._shape[1]);
    let s = 0;
    for (let i = 0; i < n; i++) s += this.get(i, i);
    return s;
  }

  diagonal(): NDArray {
    if (this.ndim !== 2) throw new RangeError(`diagonal requires 2D array`);
    const n = Math.min(this._shape[0], this._shape[1]);
    const out = new Float64Array(n);
    for (let i = 0; i < n; i++) out[i] = this.get(i, i);
    return new NDArray(out, [n]);
  }

  // ----------------------
  // Concatenation / Stacking
  // ----------------------

  static concatenate(arrays: NDArray[], axis = 0): NDArray {
    if (arrays.length === 0) throw new RangeError(`No arrays to concatenate`);
    const ndim = arrays[0].ndim;
    if (axis < 0) axis += ndim;
    for (const a of arrays) {
      if (a.ndim !== ndim)
        throw new RangeError(`All arrays must have same ndim`);
    }

    const newShape = arrays[0]._shape.slice();
    newShape[axis] = arrays.reduce((s, a) => s + a._shape[axis], 0);
    const outSize = computeSize(newShape);
    const out = new Float64Array(outSize);

    let axisOffset = 0;
    for (const arr of arrays) {
      const arrData = arr._iterData();
      const axisLen = arr._shape[axis];
      const arrSize = arr.size;
      // Copy slices
      for (let flatIn = 0; flatIn < arrSize; flatIn++) {
        const multiIn = flatToMulti(flatIn, arr._shape);
        const multiOut = multiIn.slice();
        multiOut[axis] += axisOffset;
        let flatOut = 0;
        for (let i = 0; i < newShape.length; i++)
          flatOut = flatOut * newShape[i] + multiOut[i];
        out[flatOut] = arrData[flatIn];
      }
      axisOffset += axisLen;
    }

    return new NDArray(out, newShape);
  }

  static vstack(arrays: NDArray[]): NDArray {
    const promoted = arrays.map((a) =>
      a.ndim === 1 ? a.reshape([1, a.size]) : a
    );
    return NDArray.concatenate(promoted, 0);
  }

  static hstack(arrays: NDArray[]): NDArray {
    if (arrays[0].ndim === 1) return NDArray.concatenate(arrays, 0);
    return NDArray.concatenate(arrays, 1);
  }

  static stack(arrays: NDArray[], axis = 0): NDArray {
    const expanded = arrays.map((a) => a.expandDims(axis));
    return NDArray.concatenate(expanded, axis);
  }

  // ----------------------
  // Array creation
  // ----------------------

  static zeros(shape: number | number[]): NDArray {
    const sh = typeof shape === "number" ? [shape] : shape;
    return new NDArray(new Float64Array(computeSize(sh)), sh);
  }

  static ones(shape: number | number[]): NDArray {
    const sh = typeof shape === "number" ? [shape] : shape;
    const data = new Float64Array(computeSize(sh)).fill(1);
    return new NDArray(data, sh);
  }

  static full(shape: number | number[], fill: number): NDArray {
    const sh = typeof shape === "number" ? [shape] : shape;
    const data = new Float64Array(computeSize(sh)).fill(fill);
    return new NDArray(data, sh);
  }

  static eye(n: number, m?: number, k = 0): NDArray {
    const cols = m ?? n;
    const data = new Float64Array(n * cols);
    for (let i = 0; i < n; i++) {
      const j = i + k;
      if (j >= 0 && j < cols) data[i * cols + j] = 1;
    }
    return new NDArray(data, [n, cols]);
  }

  static identity(n: number): NDArray {
    return NDArray.eye(n);
  }

  static arange(start: number, stop?: number, step = 1): NDArray {
    if (stop === undefined) {
      stop = start;
      start = 0;
    }
    if (step === 0) throw new RangeError(`Step cannot be zero`);
    const len = Math.max(0, Math.ceil((stop - start) / step));
    const data = new Float64Array(len);
    for (let i = 0; i < len; i++) data[i] = start + i * step;
    return new NDArray(data, [len]);
  }

  static linspace(
    start: number,
    stop: number,
    num = 50,
    endpoint = true
  ): NDArray {
    if (num < 0) throw new RangeError(`num must be non-negative`);
    if (num === 0) return new NDArray(new Float64Array(0), [0]);
    if (num === 1) return NDArray.from([start]);
    const step = (stop - start) / (endpoint ? num - 1 : num);
    const data = new Float64Array(num);
    for (let i = 0; i < num; i++) data[i] = start + i * step;
    if (endpoint) data[num - 1] = stop;
    return new NDArray(data, [num]);
  }

  static logspace(
    start: number,
    stop: number,
    num = 50,
    base = 10,
    endpoint = true
  ): NDArray {
    const lin = NDArray.linspace(start, stop, num, endpoint);
    return lin._applyUnaryOp((x) => Math.pow(base, x));
  }

  static geomspace(
    start: number,
    stop: number,
    num = 50,
    endpoint = true
  ): NDArray {
    return NDArray.logspace(
      Math.log10(start),
      Math.log10(stop),
      num,
      10,
      endpoint
    );
  }

  static from(data: number[] | number[][] | number[][][]): NDArray {
    if (data.length === 0) return new NDArray(new Float64Array(0), [0]);
    if (typeof data[0] === "number") {
      const arr = data as number[];
      return new NDArray(new Float64Array(arr), [arr.length]);
    }
    if (
      Array.isArray(data[0]) &&
      typeof (data[0] as number[][])[0] === "number"
    ) {
      const arr2d = data as number[][];
      const rows = arr2d.length;
      const cols = arr2d[0].length;
      const flat = new Float64Array(rows * cols);
      for (let i = 0; i < rows; i++)
        for (let j = 0; j < cols; j++) flat[i * cols + j] = arr2d[i][j];
      return new NDArray(flat, [rows, cols]);
    }
    // 3D
    const arr3d = data as number[][][];
    const d0 = arr3d.length;
    const d1 = arr3d[0].length;
    const d2 = arr3d[0][0].length;
    const flat = new Float64Array(d0 * d1 * d2);
    let idx = 0;
    for (let i = 0; i < d0; i++)
      for (let j = 0; j < d1; j++)
        for (let k = 0; k < d2; k++) flat[idx++] = arr3d[i][j][k];
    return new NDArray(flat, [d0, d1, d2]);
  }

  static diag(v: NDArray | number[], k = 0): NDArray {
    const arr = v instanceof NDArray ? Array.from(v._iterData()) : v;
    const n = arr.length + Math.abs(k);
    const data = new Float64Array(n * n);
    for (let i = 0; i < arr.length; i++) {
      const r = k >= 0 ? i : i - k;
      const c = k >= 0 ? i + k : i;
      data[r * n + c] = arr[i];
    }
    return new NDArray(data, [n, n]);
  }

  static tri(n: number, m?: number, k = 0): NDArray {
    const cols = m ?? n;
    const data = new Float64Array(n * cols);
    for (let i = 0; i < n; i++)
      for (let j = 0; j <= i + k && j < cols; j++) data[i * cols + j] = 1;
    return new NDArray(data, [n, cols]);
  }

  static tril(a: NDArray, k = 0): NDArray {
    if (a.ndim !== 2) throw new RangeError(`tril requires 2D array`);
    const [rows, cols] = a._shape;
    const out = a.copy();
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++) if (j > i + k) out.set(0, i, j);
    return out;
  }

  static triu(a: NDArray, k = 0): NDArray {
    if (a.ndim !== 2) throw new RangeError(`triu requires 2D array`);
    const [rows, cols] = a._shape;
    const out = a.copy();
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++) if (j < i + k) out.set(0, i, j);
    return out;
  }

  static random(shape: number | number[]): NDArray {
    const sh = typeof shape === "number" ? [shape] : shape;
    const data = new Float64Array(computeSize(sh));
    for (let i = 0; i < data.length; i++) data[i] = Math.random();
    return new NDArray(data, sh);
  }

  static randomNormal(shape: number | number[], mean = 0, std = 1): NDArray {
    const sh = typeof shape === "number" ? [shape] : shape;
    const data = new Float64Array(computeSize(sh));
    for (let i = 0; i < data.length; i++) {
      // Box-Muller transform
      const u1 = Math.random() || 1e-15;
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      data[i] = mean + std * z;
    }
    return new NDArray(data, sh);
  }

  static randomInt(
    low: number,
    high?: number,
    shape: number | number[] = 1
  ): NDArray {
    if (high === undefined) {
      high = low;
      low = 0;
    }
    const sh = typeof shape === "number" ? [shape] : shape;
    const data = new Float64Array(computeSize(sh));
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.floor(Math.random() * (high - low)) + low;
    }
    return new NDArray(data, sh);
  }

  static seed(_s: number): void {
    // JS doesn't have a native seeded random. This is a no-op placeholder.
    console.warn(
      "NDArray.seed(): JS does not support seeded Math.random — install 'seedrandom' for reproducibility"
    );
  }

  // ----------------------
  // Math functions (static)
  // ----------------------

  static add(a: NDArray, b: NDArray | number): NDArray {
    return a.add(b);
  }
  static subtract(a: NDArray, b: NDArray | number): NDArray {
    return a.subtract(b);
  }
  static multiply(a: NDArray, b: NDArray | number): NDArray {
    return a.multiply(b);
  }
  static divide(a: NDArray, b: NDArray | number): NDArray {
    return a.divide(b);
  }
  static power(a: NDArray, b: NDArray | number): NDArray {
    return a.power(b);
  }
  static dot(a: NDArray, b: NDArray): NDArray {
    return a.dot(b);
  }
  static matmul(a: NDArray, b: NDArray): NDArray {
    return a.matmul(b);
  }

  static where(
    condition: NDArray,
    x: NDArray | number,
    y: NDArray | number
  ): NDArray {
    return condition.where(x, y);
  }

  static clip(a: NDArray, min: number, max: number): NDArray {
    return a.clip(min, max);
  }
  static abs(a: NDArray): NDArray {
    return a.abs();
  }
  static sqrt(a: NDArray): NDArray {
    return a.sqrt();
  }
  static exp(a: NDArray): NDArray {
    return a.exp();
  }
  static log(a: NDArray): NDArray {
    return a.log();
  }
  static sin(a: NDArray): NDArray {
    return a.sin();
  }
  static cos(a: NDArray): NDArray {
    return a.cos();
  }
  static tan(a: NDArray): NDArray {
    return a.tan();
  }
  static floor(a: NDArray): NDArray {
    return a.floor();
  }
  static ceil(a: NDArray): NDArray {
    return a.ceil();
  }
  static round(a: NDArray): NDArray {
    return a.round();
  }
  static sign(a: NDArray): NDArray {
    return a.sign();
  }

  static sum(a: NDArray, axis?: number): NDArray | number {
    return a.sum(axis);
  }
  static mean(a: NDArray, axis?: number): NDArray | number {
    return a.mean(axis);
  }
  static std(a: NDArray, axis?: number, ddof?: number): NDArray | number {
    return a.std(axis, ddof);
  }
  static var(a: NDArray, axis?: number, ddof?: number): NDArray | number {
    return a.variance(axis, ddof);
  }
  static min(a: NDArray, axis?: number): NDArray | number {
    return a.min(axis);
  }
  static max(a: NDArray, axis?: number): NDArray | number {
    return a.max(axis);
  }
  static argmin(a: NDArray, axis?: number): NDArray | number {
    return a.argmin(axis);
  }
  static argmax(a: NDArray, axis?: number): NDArray | number {
    return a.argmax(axis);
  }
  static sort(a: NDArray, axis?: number): NDArray {
    return a.sort(axis);
  }
  static argsort(a: NDArray, axis?: number): NDArray {
    return a.argsort(axis);
  }
  static unique(a: NDArray): {
    values: NDArray;
    indices: NDArray;
    counts: NDArray;
  } {
    return a.unique();
  }

  // ----------------------
  // meshgrid
  // ----------------------

  static meshgrid(...xi: NDArray[]): NDArray[] {
    const N = xi.length;
    const shapes = xi.map((x) => x.size);
    const results: NDArray[] = [];
    for (let i = 0; i < N; i++) {
      let arr = xi[i].flatten();
      // Reshape to have axis i as the only non-1 dimension
      const shape: number[] = new Array(N).fill(1);
      shape[i] = shapes[i];
      arr = arr.reshape(shape);
      // Broadcast to full grid
      const fullShape = shapes.map((s, j) => (j === i ? s : shapes[j]));
      const outSize = computeSize(fullShape);
      const outData = new Float64Array(outSize);
      for (let flat = 0; flat < outSize; flat++) {
        const multi = flatToMulti(flat, fullShape);
        const srcIdx = multi.map((idx, dim) => (dim === i ? idx : 0));
        outData[flat] = arr.get(...srcIdx);
      }
      results.push(new NDArray(outData, fullShape));
    }
    return results;
  }

  // ----------------------
  // Output
  // ----------------------

  toArray(): Float64Array {
    return this._iterData();
  }

  toList(): number | number[] | number[][] | number[][][] {
    if (this.ndim === 0) return this.item(0);
    if (this.ndim === 1) return Array.from(this._iterData());
    if (this.ndim === 2) {
      const [rows, cols] = this._shape;
      const result: number[][] = [];
      for (let i = 0; i < rows; i++) {
        const row: number[] = [];
        for (let j = 0; j < cols; j++) row.push(this.get(i, j));
        result.push(row);
      }
      return result;
    }
    if (this.ndim === 3) {
      const [d0, d1, d2] = this._shape;
      const result: number[][][] = [];
      for (let i = 0; i < d0; i++) {
        const plane: number[][] = [];
        for (let j = 0; j < d1; j++) {
          const row: number[] = [];
          for (let k = 0; k < d2; k++) row.push(this.get(i, j, k));
          plane.push(row);
        }
        result.push(plane);
      }
      return result;
    }
    // Fallback: flat list
    return Array.from(this._iterData());
  }

  toString(): string {
    if (this.ndim === 1) {
      const vals = Array.from(this._iterData()).map((v) =>
        v.toFixed(4).replace(/\.?0+$/, "")
      );
      return `NDArray([${vals.join(", ")}])`;
    }
    if (this.ndim === 2) {
      const [rows, cols] = this._shape;
      const lines: string[] = [];
      for (let i = 0; i < rows; i++) {
        const row: string[] = [];
        for (let j = 0; j < cols; j++) {
          row.push(
            this.get(i, j)
              .toFixed(4)
              .replace(/\.?0+$/, "")
              .padStart(8)
          );
        }
        lines.push(`  [${row.join(", ")}]`);
      }
      return `NDArray([\n${lines.join(",\n")}\n])`;
    }
    return `NDArray(shape=[${this._shape}], dtype=float64)`;
  }

  print(): this {
    console.log(this.toString());
    return this;
  }

  [Symbol.iterator](): Iterator<number> {
    const data = this._iterData();
    let i = 0;
    return {
      next(): IteratorResult<number> {
        if (i < data.length) return { value: data[i++], done: false };
        return { value: 0, done: true };
      },
    };
  }
}

export default NDArray;
