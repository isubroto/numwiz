import NDArray from "../src/ndarray";

// ── helpers ──────────────────────────────────────────────────────────────
const close = (a: number, b: number, tol = 1e-9) => Math.abs(a - b) < tol;

function arrClose(a: number[], b: number[], tol = 1e-9) {
  expect(a.length).toBe(b.length);
  a.forEach((v, i) =>
    expect(v).toBeCloseTo(b[i], Math.round(-Math.log10(tol)))
  );
}

// ═══════════════════════════════════════════════════════════════════
// CREATION
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Creation", () => {
  test("zeros", () => {
    const a = NDArray.zeros([2, 3]);
    expect(a.shape).toEqual([2, 3]);
    expect(a.size).toBe(6);
    expect(Array.from(a.toArray())).toEqual([0, 0, 0, 0, 0, 0]);
  });

  test("ones", () => {
    const a = NDArray.ones([3]);
    expect(Array.from(a.toArray())).toEqual([1, 1, 1]);
  });

  test("full", () => {
    const a = NDArray.full([2, 2], 7);
    expect(Array.from(a.toArray())).toEqual([7, 7, 7, 7]);
  });

  test("arange", () => {
    const a = NDArray.arange(0, 5);
    expect(Array.from(a.toArray())).toEqual([0, 1, 2, 3, 4]);
  });

  test("arange with step", () => {
    const a = NDArray.arange(0, 1, 0.25);
    arrClose(Array.from(a.toArray()), [0, 0.25, 0.5, 0.75]);
  });

  test("linspace", () => {
    const a = NDArray.linspace(0, 1, 5);
    arrClose(Array.from(a.toArray()), [0, 0.25, 0.5, 0.75, 1.0]);
  });

  test("linspace endpoint false", () => {
    const a = NDArray.linspace(0, 4, 4, false);
    arrClose(Array.from(a.toArray()), [0, 1, 2, 3]);
  });

  test("eye", () => {
    const a = NDArray.eye(3);
    const list = a.toList() as number[][];
    expect(list[0][0]).toBe(1);
    expect(list[0][1]).toBe(0);
    expect(list[1][1]).toBe(1);
    expect(list[2][2]).toBe(1);
  });

  test("from nested array", () => {
    const a = NDArray.from([
      [1, 2],
      [3, 4],
    ]);
    expect(a.shape).toEqual([2, 2]);
    expect(a.get(1, 0)).toBe(3);
  });

  test("from 1D array", () => {
    const a = NDArray.from([10, 20, 30]);
    expect(a.ndim).toBe(1);
    expect(a.size).toBe(3);
  });

  test("diag from vector", () => {
    const d = NDArray.diag(NDArray.from([1, 2, 3]));
    const list = d.toList() as number[][];
    expect(list[0][0]).toBe(1);
    expect(list[1][1]).toBe(2);
    expect(list[2][2]).toBe(3);
    expect(list[0][1]).toBe(0);
  });

  test("logspace", () => {
    const a = NDArray.logspace(0, 2, 3);
    arrClose(Array.from(a.toArray()), [1, 10, 100]);
  });

  test("geomspace", () => {
    const a = NDArray.geomspace(1, 1000, 4);
    arrClose(Array.from(a.toArray()), [1, 10, 100, 1000]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SHAPE OPERATIONS
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Shape Operations", () => {
  test("reshape", () => {
    const a = NDArray.arange(0, 6).reshape([2, 3]);
    expect(a.shape).toEqual([2, 3]);
    expect(a.get(1, 2)).toBe(5);
  });

  test("reshape with -1", () => {
    const a = NDArray.arange(0, 12).reshape([3, -1]);
    expect(a.shape).toEqual([3, 4]);
  });

  test("flatten", () => {
    const a = NDArray.from([
      [1, 2],
      [3, 4],
    ]).flatten();
    expect(a.ndim).toBe(1);
    expect(Array.from(a.toArray())).toEqual([1, 2, 3, 4]);
  });

  test("transpose", () => {
    const a = NDArray.from([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    const t = a.transpose();
    expect(t.shape).toEqual([3, 2]);
    expect(t.get(2, 1)).toBe(6);
  });

  test(".T getter", () => {
    const a = NDArray.from([
      [1, 2],
      [3, 4],
    ]);
    const t = a.T;
    expect(t.get(0, 1)).toBe(3);
    expect(t.get(1, 0)).toBe(2);
  });

  test("squeeze removes size-1 dims", () => {
    const a = NDArray.zeros([1, 3, 1]);
    expect(a.squeeze().shape).toEqual([3]);
  });

  test("expandDims", () => {
    const a = NDArray.from([1, 2, 3]);
    expect(a.expandDims(0).shape).toEqual([1, 3]);
    expect(a.expandDims(1).shape).toEqual([3, 1]);
  });

  test("swapaxes", () => {
    const a = NDArray.arange(0, 6).reshape([2, 3]);
    const b = a.swapaxes(0, 1);
    expect(b.shape).toEqual([3, 2]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// INDEXING & SLICING
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Indexing & Slicing", () => {
  test("get/set scalar", () => {
    const a = NDArray.zeros([3, 3]);
    a.set(42, 1, 2);
    expect(a.get(1, 2)).toBe(42);
  });

  test("slice all (null)", () => {
    const a = NDArray.arange(0, 6).reshape([2, 3]);
    const s = a.slice(null);
    expect(s.shape).toEqual([2, 3]);
  });

  test("slice row index (number)", () => {
    const a = NDArray.arange(0, 6).reshape([2, 3]);
    const row = a.slice(1);
    expect(row.shape).toEqual([3]);
    expect(Array.from(row.toArray())).toEqual([3, 4, 5]);
  });

  test("slice range", () => {
    const a = NDArray.arange(0, 10);
    const s = a.slice([2, 7]);
    expect(Array.from(s.toArray())).toEqual([2, 3, 4, 5, 6]);
  });

  test("slice with step", () => {
    const a = NDArray.arange(0, 10);
    const s = a.slice([undefined, undefined, 2]);
    expect(Array.from(s.toArray())).toEqual([0, 2, 4, 6, 8]);
  });

  test("item(i)", () => {
    const a = NDArray.from([10, 20, 30]);
    expect(a.item(1)).toBe(20);
  });
});

// ═══════════════════════════════════════════════════════════════════
// ARITHMETIC & BROADCASTING
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Arithmetic", () => {
  test("add scalar", () => {
    const a = NDArray.from([1, 2, 3]);
    arrClose(Array.from(a.add(10).toArray()), [11, 12, 13]);
  });

  test("add arrays", () => {
    const a = NDArray.from([1, 2, 3]);
    const b = NDArray.from([4, 5, 6]);
    arrClose(Array.from(a.add(b).toArray()), [5, 7, 9]);
  });

  test("subtract", () => {
    const a = NDArray.from([5, 6, 7]).subtract(NDArray.from([1, 2, 3]));
    arrClose(Array.from(a.toArray()), [4, 4, 4]);
  });

  test("multiply", () => {
    const a = NDArray.from([2, 3, 4]).multiply(NDArray.from([3, 2, 1]));
    arrClose(Array.from(a.toArray()), [6, 6, 4]);
  });

  test("divide", () => {
    const a = NDArray.from([6, 8, 10]).divide(NDArray.from([2, 4, 5]));
    arrClose(Array.from(a.toArray()), [3, 2, 2]);
  });

  test("power", () => {
    const a = NDArray.from([2, 3, 4]).power(2);
    arrClose(Array.from(a.toArray()), [4, 9, 16]);
  });

  test("negative", () => {
    const a = NDArray.from([1, -2, 3]).negative();
    arrClose(Array.from(a.toArray()), [-1, 2, -3]);
  });

  test("modulo", () => {
    const a = NDArray.from([7, 8, 9]).modulo(3);
    arrClose(Array.from(a.toArray()), [1, 2, 0]);
  });

  test("maximum element-wise", () => {
    const a = NDArray.from([1, 5, 3]).maximum(NDArray.from([4, 2, 3]));
    arrClose(Array.from(a.toArray()), [4, 5, 3]);
  });

  test("minimum element-wise", () => {
    const a = NDArray.from([1, 5, 3]).minimum(NDArray.from([4, 2, 3]));
    arrClose(Array.from(a.toArray()), [1, 2, 3]);
  });

  test("broadcasting: (3,1) + (1,3)", () => {
    const a = NDArray.from([[1], [2], [3]]);
    const b = NDArray.from([[10, 20, 30]]);
    const c = a.add(b);
    expect(c.shape).toEqual([3, 3]);
    expect(c.get(0, 1)).toBe(21);
    expect(c.get(2, 2)).toBe(33);
  });
});

// ═══════════════════════════════════════════════════════════════════
// MATH FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Unary Math", () => {
  test("sqrt", () => {
    const a = NDArray.from([4, 9, 16]).sqrt();
    arrClose(Array.from(a.toArray()), [2, 3, 4]);
  });

  test("abs", () => {
    const a = NDArray.from([-3, -1, 2]).abs();
    arrClose(Array.from(a.toArray()), [3, 1, 2]);
  });

  test("exp", () => {
    const a = NDArray.from([0, 1]).exp();
    arrClose(Array.from(a.toArray()), [1, Math.E]);
  });

  test("log", () => {
    const a = NDArray.from([1, Math.E]).log();
    arrClose(Array.from(a.toArray()), [0, 1]);
  });

  test("sin", () => {
    const a = NDArray.from([0, Math.PI / 2]).sin();
    arrClose(Array.from(a.toArray()), [0, 1]);
  });

  test("floor / ceil / round", () => {
    const a = NDArray.from([1.2, 2.7, -1.5]);
    arrClose(Array.from(a.floor().toArray()), [1, 2, -2]);
    arrClose(Array.from(a.ceil().toArray()), [2, 3, -1]);
    // JS Math.round(-1.5) = -1 (rounds toward +Infinity at .5)
    arrClose(Array.from(a.round().toArray()), [1, 3, -1]);
  });

  test("clip", () => {
    const a = NDArray.from([-5, 0, 5, 10, 15]).clip(0, 10);
    arrClose(Array.from(a.toArray()), [0, 0, 5, 10, 10]);
  });

  test("square", () => {
    const a = NDArray.from([3, 4, 5]).square();
    arrClose(Array.from(a.toArray()), [9, 16, 25]);
  });

  test("sign", () => {
    const a = NDArray.from([-3, 0, 7]).sign();
    arrClose(Array.from(a.toArray()), [-1, 0, 1]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// COMPARISONS
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Comparisons", () => {
  test("greater", () => {
    const a = NDArray.from([1, 5, 3]).greater(NDArray.from([2, 3, 3]));
    expect(Array.from(a.toArray())).toEqual([0, 1, 0]);
  });

  test("equal", () => {
    const a = NDArray.from([1, 2, 3]).equal(NDArray.from([1, 0, 3]));
    expect(Array.from(a.toArray())).toEqual([1, 0, 1]);
  });

  test("less", () => {
    const a = NDArray.from([1, 5, 3]).less(4);
    expect(Array.from(a.toArray())).toEqual([1, 0, 1]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// REDUCTIONS
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Reductions", () => {
  test("sum all", () => {
    expect(NDArray.from([1, 2, 3, 4]).sum()).toBe(10);
  });

  test("sum axis=0", () => {
    const a = NDArray.from([
      [1, 2],
      [3, 4],
    ]);
    const s = a.sum(0) as NDArray;
    arrClose(Array.from(s.toArray()), [4, 6]);
  });

  test("sum axis=1", () => {
    const a = NDArray.from([
      [1, 2],
      [3, 4],
    ]);
    const s = a.sum(1) as NDArray;
    arrClose(Array.from(s.toArray()), [3, 7]);
  });

  test("mean", () => {
    expect(NDArray.from([1, 2, 3, 4, 5]).mean()).toBe(3);
  });

  test("min / max", () => {
    const a = NDArray.from([3, 1, 4, 1, 5, 9]);
    expect(a.min()).toBe(1);
    expect(a.max()).toBe(9);
  });

  test("argmin / argmax", () => {
    const a = NDArray.from([3, 1, 4, 1, 5]);
    expect(a.argmin()).toBe(1);
    expect(a.argmax()).toBe(4);
  });

  test("product", () => {
    expect(NDArray.from([1, 2, 3, 4]).product()).toBe(24);
  });

  test("variance (population)", () => {
    const v = NDArray.from([2, 4, 4, 4, 5, 5, 7, 9]).variance() as number;
    expect(v).toBeCloseTo(4, 5);
  });

  test("std", () => {
    const s = NDArray.from([2, 4, 4, 4, 5, 5, 7, 9]).std() as number;
    expect(s).toBeCloseTo(2, 5);
  });
});

// ═══════════════════════════════════════════════════════════════════
// BOOLEAN OPS
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Boolean ops", () => {
  test("any true", () => expect(NDArray.from([0, 0, 1]).any()).toBe(true));
  test("any false", () => expect(NDArray.from([0, 0, 0]).any()).toBe(false));
  test("all true", () => expect(NDArray.from([1, 2, 3]).all()).toBe(true));
  test("all false", () => expect(NDArray.from([1, 0, 3]).all()).toBe(false));

  test("nonzero", () => {
    const nz = NDArray.from([0, 1, 0, 2, 0]).nonzero();
    expect(nz.length).toBe(1); // 1-D array → 1 NDArray of indices
    expect(Array.from(nz[0].toArray())).toEqual([1, 3]);
  });

  test("where (3-arg)", () => {
    const cond = NDArray.from([1, 0, 1]);
    const x = NDArray.from([10, 20, 30]);
    const y = NDArray.from([100, 200, 300]);
    const result = cond.where(x, y);
    arrClose(Array.from(result.toArray()), [10, 200, 30]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// SORTING
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Sorting", () => {
  test("sort ascending", () => {
    const a = NDArray.from([3, 1, 4, 1, 5, 9, 2, 6]).sort();
    expect(Array.from(a.toArray())).toEqual([1, 1, 2, 3, 4, 5, 6, 9]);
  });

  test("argsort", () => {
    const a = NDArray.from([30, 10, 20]);
    const idx = a.argsort();
    expect(Array.from(idx.toArray())).toEqual([1, 2, 0]);
  });

  test("unique", () => {
    const { values, counts } = NDArray.from([1, 2, 2, 3, 3, 3]).unique();
    expect(Array.from(values.toArray())).toEqual([1, 2, 3]);
    expect(Array.from(counts.toArray())).toEqual([1, 2, 3]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// MATRIX OPS (2D)
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Matrix ops (2D)", () => {
  test("dot (matrix mul)", () => {
    const a = NDArray.from([
      [1, 2],
      [3, 4],
    ]);
    const b = NDArray.from([
      [5, 6],
      [7, 8],
    ]);
    const c = a.dot(b);
    expect(c.shape).toEqual([2, 2]);
    expect(c.get(0, 0)).toBe(19);
    expect(c.get(0, 1)).toBe(22);
    expect(c.get(1, 0)).toBe(43);
    expect(c.get(1, 1)).toBe(50);
  });

  test("trace", () => {
    const a = NDArray.from([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    expect(a.trace()).toBe(15);
  });

  test("diagonal", () => {
    const a = NDArray.from([
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ]);
    arrClose(Array.from(a.diagonal().toArray()), [1, 5, 9]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// CONCATENATION
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Concatenation", () => {
  test("concatenate axis=0", () => {
    const a = NDArray.from([
      [1, 2],
      [3, 4],
    ]);
    const b = NDArray.from([[5, 6]]);
    const c = NDArray.concatenate([a, b], 0);
    expect(c.shape).toEqual([3, 2]);
  });

  test("hstack", () => {
    const a = NDArray.from([
      [1, 2],
      [3, 4],
    ]);
    const b = NDArray.from([[5], [6]]);
    const c = NDArray.hstack([a, b]);
    expect(c.shape).toEqual([2, 3]);
    expect(c.get(0, 2)).toBe(5);
    expect(c.get(1, 2)).toBe(6);
  });

  test("vstack", () => {
    const a = NDArray.from([[1, 2]]);
    const b = NDArray.from([[3, 4]]);
    const c = NDArray.vstack([a, b]);
    expect(c.shape).toEqual([2, 2]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// OUTPUT
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Output", () => {
  test("toArray returns Float64Array", () => {
    const a = NDArray.from([1, 2, 3]);
    expect(a.toArray()).toBeInstanceOf(Float64Array);
  });

  test("toList for 2D returns nested arrays", () => {
    const a = NDArray.from([
      [1, 2],
      [3, 4],
    ]);
    expect(a.toList()).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test("toString returns string", () => {
    expect(typeof NDArray.from([1, 2]).toString()).toBe("string");
  });

  test("Symbol.iterator", () => {
    const vals: number[] = [];
    for (const v of NDArray.from([7, 8, 9])) vals.push(v);
    expect(vals).toEqual([7, 8, 9]);
  });

  test("copy is independent", () => {
    const a = NDArray.from([1, 2, 3]);
    const b = a.copy();
    b.set(99, 0);
    expect(a.item(0)).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════
// STATIC API
// ═══════════════════════════════════════════════════════════════════
describe("NDArray — Static API", () => {
  test("NDArray.add", () => {
    const a = NDArray.from([1, 2, 3]);
    const b = NDArray.from([10, 20, 30]);
    arrClose(Array.from(NDArray.add(a, b).toArray()), [11, 22, 33]);
  });

  test("NDArray.sum", () => {
    expect(NDArray.sum(NDArray.from([1, 2, 3, 4]))).toBe(10);
  });

  test("NDArray.mean", () => {
    expect(NDArray.mean(NDArray.from([1, 2, 3]))).toBe(2);
  });
});
