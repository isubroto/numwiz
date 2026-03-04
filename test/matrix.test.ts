import { Matrix } from "../index";

// ═══════════════════════════════════════
// CREATION — all return plain [][]
// ═══════════════════════════════════════
describe("Matrix Creation", () => {
  test("create returns plain array", () => {
    const m = Matrix.create(2, 3);
    expect(m).toEqual([
      [0, 0, 0],
      [0, 0, 0],
    ]);
    expect(Array.isArray(m)).toBe(true);
    expect(Array.isArray(m[0])).toBe(true);
  });

  test("create with fill value", () => {
    expect(Matrix.create(2, 2, 7)).toEqual([
      [7, 7],
      [7, 7],
    ]);
  });

  test("create invalid dims throws RangeError", () => {
    expect(() => Matrix.create(0, 3)).toThrow(RangeError);
    expect(() => Matrix.create(-1, 3)).toThrow(RangeError);
    expect(() => Matrix.create(2.5, 3)).toThrow(RangeError);
  });

  test("identity returns plain array", () => {
    const I = Matrix.identity(3);
    expect(I).toEqual([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ]);
    expect(Array.isArray(I)).toBe(true);
  });

  test("zeros", () => {
    expect(Matrix.zeros(2, 3)).toEqual([
      [0, 0, 0],
      [0, 0, 0],
    ]);
  });

  test("ones", () => {
    expect(Matrix.ones(2, 2)).toEqual([
      [1, 1],
      [1, 1],
    ]);
  });

  test("fill", () => {
    expect(Matrix.fill(2, 2, 5)).toEqual([
      [5, 5],
      [5, 5],
    ]);
  });

  test("diagonal", () => {
    expect(Matrix.diagonal([1, 2, 3])).toEqual([
      [1, 0, 0],
      [0, 2, 0],
      [0, 0, 3],
    ]);
  });

  test("fromFlat", () => {
    expect(Matrix.fromFlat([1, 2, 3, 4, 5, 6], 2, 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  test("fromFlat size mismatch throws RangeError", () => {
    expect(() => Matrix.fromFlat([1, 2, 3], 2, 2)).toThrow(RangeError);
  });

  test("fromArray validates and returns copy", () => {
    const original = [
      [1, 2],
      [3, 4],
    ];
    const copy = Matrix.fromArray(original);
    expect(copy).toEqual(original);
    copy[0][0] = 99;
    expect(original[0][0]).toBe(1);
  });

  test("fromArray invalid input throws TypeError", () => {
    expect(() => Matrix.fromArray([])).toThrow(TypeError);
    expect(() => Matrix.fromArray([[1, 2], [3]])).toThrow(TypeError);
    expect(() => Matrix.fromArray([[1, "a" as any]])).toThrow(TypeError);
    expect(() => Matrix.fromArray([[NaN]])).toThrow(TypeError);
  });

  test("columnVector", () => {
    expect(Matrix.columnVector([1, 2, 3])).toEqual([[1], [2], [3]]);
  });

  test("rowVector", () => {
    expect(Matrix.rowVector([1, 2, 3])).toEqual([[1, 2, 3]]);
  });

  test("random", () => {
    const r = Matrix.random(3, 3, 0, 10, true);
    expect(r.length).toBe(3);
    expect(r[0].length).toBe(3);
    r.forEach((row) =>
      row.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(10);
        expect(Number.isInteger(v)).toBe(true);
      })
    );
  });

  test("rotation2D", () => {
    const R = Matrix.rotation2D(Math.PI / 2);
    expect(R[0][0]).toBeCloseTo(0);
    expect(R[0][1]).toBeCloseTo(-1);
    expect(R[1][0]).toBeCloseTo(1);
    expect(R[1][1]).toBeCloseTo(0);
  });

  test("scaling", () => {
    expect(Matrix.scaling(2, 3)).toEqual([
      [2, 0],
      [0, 3],
    ]);
  });

  test("hilbert", () => {
    const H = Matrix.hilbert(3);
    expect(H[0][0]).toBe(1);
    expect(H[0][1]).toBeCloseTo(0.5);
  });

  test("vandermonde", () => {
    expect(Matrix.vandermonde([1, 2, 3], 3)).toEqual([
      [1, 1, 1],
      [1, 2, 4],
      [1, 3, 9],
    ]);
  });
});

// ═══════════════════════════════════════
// INSPECTION
// ═══════════════════════════════════════
describe("Matrix Inspection", () => {
  const m = [
    [1, 2, 3],
    [4, 5, 6],
  ];

  test("shape", () => expect(Matrix.shape(m)).toEqual([2, 3]));
  test("rows", () => expect(Matrix.rows(m)).toBe(2));
  test("cols", () => expect(Matrix.cols(m)).toBe(3));
  test("size", () => expect(Matrix.size(m)).toBe(6));

  test("get", () => {
    expect(Matrix.get(m, 0, 0)).toBe(1);
    expect(Matrix.get(m, 1, 2)).toBe(6);
  });

  test("get out of range throws RangeError", () => {
    expect(() => Matrix.get(m, 2, 0)).toThrow(RangeError);
    expect(() => Matrix.get(m, 0, 3)).toThrow(RangeError);
    expect(() => Matrix.get(m, -1, 0)).toThrow(RangeError);
  });

  test("set returns new array", () => {
    const result = Matrix.set(m, 0, 0, 99);
    expect(result[0][0]).toBe(99);
    expect(m[0][0]).toBe(1);
  });

  test("getRow", () => expect(Matrix.getRow(m, 1)).toEqual([4, 5, 6]));
  test("getCol", () => expect(Matrix.getCol(m, 0)).toEqual([1, 4]));

  test("getDiagonal", () => {
    expect(
      Matrix.getDiagonal([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
    ).toEqual([1, 5, 9]);
  });

  test("toArray deep copies", () => {
    const copy = Matrix.toArray(m);
    expect(copy).toEqual(m);
    copy[0][0] = 99;
    expect(m[0][0]).toBe(1);
  });

  test("clone deep copies", () => {
    const copy = Matrix.clone(m);
    expect(copy).toEqual(m);
    copy[0][0] = 99;
    expect(m[0][0]).toBe(1);
  });
});

// ═══════════════════════════════════════
// ARITHMETIC — all return plain [][]
// ═══════════════════════════════════════
describe("Matrix Arithmetic", () => {
  const A = [
    [1, 2],
    [3, 4],
  ];
  const B = [
    [5, 6],
    [7, 8],
  ];

  test("add returns plain array", () => {
    const result = Matrix.add(A, B);
    expect(result).toEqual([
      [6, 8],
      [10, 12],
    ]);
    expect(Array.isArray(result)).toBe(true);
  });

  test("add size mismatch throws RangeError", () => {
    expect(() => Matrix.add(A, [[1, 2, 3]])).toThrow(RangeError);
  });

  test("subtract", () => {
    expect(Matrix.subtract(B, A)).toEqual([
      [4, 4],
      [4, 4],
    ]);
  });

  test("multiply", () => {
    expect(Matrix.multiply(A, B)).toEqual([
      [19, 22],
      [43, 50],
    ]);
  });

  test("multiply dimension mismatch throws RangeError", () => {
    expect(() => Matrix.multiply(A, [[1, 2, 3]])).toThrow(RangeError);
  });

  test("scale", () => {
    expect(Matrix.scale(A, 3)).toEqual([
      [3, 6],
      [9, 12],
    ]);
  });

  test("scalarMultiply (alias)", () => {
    expect(Matrix.scalarMultiply(A, 2)).toEqual([
      [2, 4],
      [6, 8],
    ]);
  });

  test("scalarDivide", () => {
    expect(
      Matrix.scalarDivide(
        [
          [4, 8],
          [12, 16],
        ],
        4
      )
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test("scalarDivide by zero throws", () => {
    expect(() => Matrix.scalarDivide(A, 0)).toThrow();
  });

  test("scalarAdd", () => {
    expect(Matrix.scalarAdd(A, 10)).toEqual([
      [11, 12],
      [13, 14],
    ]);
  });

  test("scalarSubtract", () => {
    expect(Matrix.scalarSubtract(A, 1)).toEqual([
      [0, 1],
      [2, 3],
    ]);
  });

  test("negate", () => {
    expect(Matrix.negate(A)).toEqual([
      [-1, -2],
      [-3, -4],
    ]);
  });

  test("hadamard", () => {
    expect(Matrix.hadamard(A, B)).toEqual([
      [5, 12],
      [21, 32],
    ]);
  });

  test("elementDivide", () => {
    expect(
      Matrix.elementDivide(
        [
          [4, 6],
          [8, 10],
        ],
        [
          [2, 3],
          [4, 5],
        ]
      )
    ).toEqual([
      [2, 2],
      [2, 2],
    ]);
  });

  test("elementDivide by zero throws", () => {
    expect(() =>
      Matrix.elementDivide(A, [
        [0, 1],
        [1, 1],
      ])
    ).toThrow();
  });

  test("elementPower", () => {
    expect(Matrix.elementPower(A, 2)).toEqual([
      [1, 4],
      [9, 16],
    ]);
  });

  test("power", () => {
    expect(Matrix.power(A, 2)).toEqual([
      [7, 10],
      [15, 22],
    ]);
  });

  test("power(0) = identity", () => {
    expect(Matrix.power(A, 0)).toEqual(Matrix.identity(2));
  });

  test("power non-square throws RangeError", () => {
    expect(() => Matrix.power([[1, 2, 3]], 2)).toThrow(RangeError);
  });

  test("power negative throws RangeError", () => {
    expect(() => Matrix.power(A, -1)).toThrow(RangeError);
  });
});

// ═══════════════════════════════════════
// TRANSFORMATIONS
// ═══════════════════════════════════════
describe("Matrix Transformations", () => {
  test("transpose", () => {
    expect(
      Matrix.transpose([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  test("transpose of transpose = original", () => {
    const m = [
      [1, 2],
      [3, 4],
    ];
    expect(Matrix.transpose(Matrix.transpose(m))).toEqual(m);
  });

  test("inverse 2×2", () => {
    const A = [
      [4, 7],
      [2, 6],
    ];
    const inv = Matrix.inverse(A);
    const product = Matrix.multiply(A, inv);
    expect(Matrix.isIdentity(Matrix.round(product, 10))).toBe(true);
  });

  test("inverse 3×3", () => {
    const A = [
      [1, 2, 3],
      [0, 1, 4],
      [5, 6, 0],
    ];
    const product = Matrix.multiply(A, Matrix.inverse(A));
    expect(Matrix.isIdentity(Matrix.round(product, 10))).toBe(true);
  });

  test("inverse singular throws Error", () => {
    expect(() =>
      Matrix.inverse([
        [1, 2],
        [2, 4],
      ])
    ).toThrow(Error);
  });

  test("inverse non-square throws RangeError", () => {
    expect(() => Matrix.inverse([[1, 2, 3]])).toThrow(RangeError);
  });

  test("minor", () => {
    expect(
      Matrix.minor(
        [
          [1, 2, 3],
          [4, 5, 6],
          [7, 8, 9],
        ],
        0,
        0
      )
    ).toEqual([
      [5, 6],
      [8, 9],
    ]);
  });

  test("cofactor", () => {
    const m = [
      [1, 2, 3],
      [0, 1, 4],
      [5, 6, 0],
    ];
    expect(Matrix.cofactor(m, 0, 0)).toBe(-24);
  });

  test("adjugate identity: A × adj(A) = det(A) × I", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const product = Matrix.multiply(A, Matrix.adjugate(A));
    const expected = Matrix.scale(Matrix.identity(2), Matrix.determinant(A));
    expect(Matrix.equals(product, expected)).toBe(true);
  });
});

// ═══════════════════════════════════════
// SCALAR PROPERTIES
// ═══════════════════════════════════════
describe("Scalar Properties", () => {
  test("determinant 1×1", () => expect(Matrix.determinant([[5]])).toBe(5));
  test("determinant 2×2", () =>
    expect(
      Matrix.determinant([
        [1, 2],
        [3, 4],
      ])
    ).toBe(-2));

  test("determinant 3×3", () => {
    expect(
      Matrix.determinant([
        [6, 1, 1],
        [4, -2, 5],
        [2, 8, 7],
      ])
    ).toBe(-306);
  });

  test("determinant 4×4", () => {
    expect(
      Matrix.determinant([
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [2, 6, 4, 8],
        [3, 1, 1, 2],
      ])
    ).toBeCloseTo(72);
  });

  test("determinant identity = 1", () => {
    expect(Matrix.determinant(Matrix.identity(4))).toBe(1);
  });

  test("determinant singular = 0", () => {
    expect(
      Matrix.determinant([
        [1, 2],
        [2, 4],
      ])
    ).toBe(0);
  });

  test("determinant non-square throws RangeError", () => {
    expect(() => Matrix.determinant([[1, 2, 3]])).toThrow(RangeError);
  });

  test("trace", () =>
    expect(
      Matrix.trace([
        [1, 2],
        [3, 4],
      ])
    ).toBe(5));

  test("trace non-square throws RangeError", () => {
    expect(() => Matrix.trace([[1, 2, 3]])).toThrow(RangeError);
  });

  test("sum", () =>
    expect(
      Matrix.sum([
        [1, 2],
        [3, 4],
      ])
    ).toBe(10));
  test("min", () =>
    expect(
      Matrix.min([
        [3, 1],
        [4, 2],
      ])
    ).toBe(1));
  test("max", () =>
    expect(
      Matrix.max([
        [3, 1],
        [4, 2],
      ])
    ).toBe(4));
  test("mean", () =>
    expect(
      Matrix.mean([
        [2, 4],
        [6, 8],
      ])
    ).toBe(5));

  test("normFrobenius", () => {
    expect(
      Matrix.normFrobenius([
        [1, 2],
        [3, 4],
      ])
    ).toBeCloseTo(Math.sqrt(30));
  });

  test("rank full", () =>
    expect(
      Matrix.rank([
        [1, 2],
        [3, 4],
      ])
    ).toBe(2));
  test("rank deficient", () =>
    expect(
      Matrix.rank([
        [1, 2],
        [2, 4],
      ])
    ).toBe(1));
  test("rank rectangular", () =>
    expect(
      Matrix.rank([
        [1, 2, 3],
        [4, 5, 6],
      ])
    ).toBe(2));
});

// ═══════════════════════════════════════
// ROW / COLUMN OPERATIONS
// ═══════════════════════════════════════
describe("Row & Column Operations", () => {
  test("swapRows", () => {
    expect(
      Matrix.swapRows(
        [
          [1, 2],
          [3, 4],
        ],
        0,
        1
      )
    ).toEqual([
      [3, 4],
      [1, 2],
    ]);
  });

  test("swapRows out of range throws RangeError", () => {
    expect(() => Matrix.swapRows([[1, 2]], 0, 5)).toThrow(RangeError);
  });

  test("swapCols", () => {
    expect(
      Matrix.swapCols(
        [
          [1, 2],
          [3, 4],
        ],
        0,
        1
      )
    ).toEqual([
      [2, 1],
      [4, 3],
    ]);
  });

  test("swapCols out of range throws RangeError", () => {
    expect(() => Matrix.swapCols([[1, 2]], 0, 5)).toThrow(RangeError);
  });

  test("scaleRow", () => {
    expect(
      Matrix.scaleRow(
        [
          [1, 2],
          [3, 4],
        ],
        0,
        3
      )
    ).toEqual([
      [3, 6],
      [3, 4],
    ]);
  });

  test("addRowMultiple", () => {
    expect(
      Matrix.addRowMultiple(
        [
          [1, 2],
          [3, 4],
        ],
        1,
        0,
        2
      )
    ).toEqual([
      [1, 2],
      [5, 8],
    ]);
  });

  test("ref", () => {
    const r = Matrix.ref([
      [2, 1, -1],
      [-3, -1, 2],
      [-2, 1, 2],
    ]);
    expect(Math.abs(r[1][0])).toBeLessThan(1e-10);
    expect(Math.abs(r[2][0])).toBeLessThan(1e-10);
  });

  test("rref of full rank = identity", () => {
    expect(
      Matrix.isIdentity(
        Matrix.rref([
          [2, 4],
          [1, 3],
        ])
      )
    ).toBe(true);
  });
});

// ═══════════════════════════════════════
// DECOMPOSITION
// ═══════════════════════════════════════
describe("Decomposition", () => {
  test("LU: PA = LU, returns plain arrays", () => {
    const A = [
      [2, 1, 1],
      [4, 3, 3],
      [8, 7, 9],
    ];
    const { L, U, P } = Matrix.lu(A);

    expect(Array.isArray(L)).toBe(true);
    expect(Array.isArray(L[0])).toBe(true);

    const PA = Matrix.multiply(P, A);
    const LU = Matrix.multiply(L, U);
    expect(Matrix.equals(PA, LU, 1e-8)).toBe(true);
    expect(Matrix.isLowerTriangular(L)).toBe(true);
    expect(Matrix.isUpperTriangular(U)).toBe(true);
  });

  test("QR: A = QR, returns plain arrays", () => {
    const A = [
      [12, -51, 4],
      [6, 167, -68],
      [-4, 24, -41],
    ];
    const { Q, R } = Matrix.qr(A);

    expect(Array.isArray(Q)).toBe(true);

    const QR = Matrix.multiply(Q, R);
    expect(Matrix.equals(QR, A, 1e-8)).toBe(true);
    expect(Matrix.isOrthogonal(Matrix.round(Q, 10))).toBe(true);
    expect(Matrix.isUpperTriangular(Matrix.round(R, 10))).toBe(true);
  });

  test("eigenvalues 2×2", () => {
    const eigs = Matrix.eigenvalues([
      [2, 1],
      [1, 2],
    ]).sort((a, b) => b - a);
    expect(eigs[0]).toBeCloseTo(3);
    expect(eigs[1]).toBeCloseTo(1);
  });

  test("eigenvalues diagonal", () => {
    const eigs = Matrix.eigenvalues(Matrix.diagonal([5, 3, 1])).sort(
      (a, b) => b - a
    );
    expect(eigs[0]).toBeCloseTo(5);
    expect(eigs[1]).toBeCloseTo(3);
    expect(eigs[2]).toBeCloseTo(1);
  });
});

// ═══════════════════════════════════════
// SOLVING Ax = b
// ═══════════════════════════════════════
describe("Solving Ax = b", () => {
  test("solve 2×2 returns plain array", () => {
    const A = [
      [2, 1],
      [1, 3],
    ];
    const b = [[5], [10]];
    const x = Matrix.solve(A, b);
    expect(Array.isArray(x)).toBe(true);
    expect(x[0][0]).toBeCloseTo(1);
    expect(x[1][0]).toBeCloseTo(3);
  });

  test("solve accepts flat b array", () => {
    const x = Matrix.solve(
      [
        [2, 1],
        [1, 3],
      ],
      [5, 10]
    );
    expect(x[0][0]).toBeCloseTo(1);
    expect(x[1][0]).toBeCloseTo(3);
  });

  test("solve 3×3", () => {
    const A = [
      [1, 1, 1],
      [0, 2, 5],
      [2, 5, -1],
    ];
    const b = [6, -4, 27];
    const x = Matrix.solve(A, b);
    expect(x[0][0]).toBeCloseTo(5);
    expect(x[1][0]).toBeCloseTo(3);
    expect(x[2][0]).toBeCloseTo(-2);
  });

  test("solve singular throws Error", () => {
    expect(() =>
      Matrix.solve(
        [
          [1, 2],
          [2, 4],
        ],
        [3, 6]
      )
    ).toThrow(Error);
  });

  test("solveCramer returns 2D column vector", () => {
    const x = Matrix.solveCramer(
      [
        [2, 1],
        [1, 3],
      ],
      [5, 10]
    );
    expect(Array.isArray(x)).toBe(true);
    expect(x[0][0]).toBeCloseTo(1);
    expect(x[1][0]).toBeCloseTo(3);
  });
});

// ═══════════════════════════════════════
// STRUCTURE: hStack, vStack, slice
// ═══════════════════════════════════════
describe("Structure Operations", () => {
  test("hStack", () => {
    expect(
      Matrix.hStack(
        [
          [1, 2],
          [3, 4],
        ],
        [[5], [6]]
      )
    ).toEqual([
      [1, 2, 5],
      [3, 4, 6],
    ]);
  });

  test("hStack row mismatch throws RangeError", () => {
    expect(() => Matrix.hStack([[1, 2]], [[1], [2]])).toThrow(RangeError);
  });

  test("hConcat (alias)", () => {
    expect(Matrix.hConcat([[1], [2]], [[3], [4]])).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });

  test("vStack", () => {
    expect(Matrix.vStack([[1, 2]], [[3, 4]])).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  test("vStack col mismatch throws RangeError", () => {
    expect(() => Matrix.vStack([[1, 2]], [[1, 2, 3]])).toThrow(RangeError);
  });

  test("vConcat (alias)", () => {
    expect(
      Matrix.vConcat(
        [[1, 2]],
        [
          [3, 4],
          [5, 6],
        ]
      )
    ).toEqual([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
  });

  test("slice", () => {
    const m = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(Matrix.slice(m, 0, 0, 2, 2)).toEqual([
      [1, 2],
      [4, 5],
    ]);
  });

  test("slice invalid range throws RangeError", () => {
    expect(() => Matrix.slice([[1, 2]], 0, 0, 5, 5)).toThrow(RangeError);
  });

  test("subMatrix (alias)", () => {
    const m = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ];
    expect(Matrix.subMatrix(m, 1, 1, 3, 3)).toEqual([
      [5, 6],
      [8, 9],
    ]);
  });

  test("reshape", () => {
    expect(Matrix.reshape([[1, 2, 3, 4, 5, 6]], 2, 3)).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });

  test("reshape size mismatch throws RangeError", () => {
    expect(() => Matrix.reshape([[1, 2, 3]], 2, 2)).toThrow(RangeError);
  });

  test("flatten", () => {
    expect(
      Matrix.flatten([
        [1, 2],
        [3, 4],
      ])
    ).toEqual([1, 2, 3, 4]);
  });
});

// ═══════════════════════════════════════
// BOOLEAN CHECKS
// ═══════════════════════════════════════
describe("Boolean Checks", () => {
  test("isSquare", () => {
    expect(
      Matrix.isSquare([
        [1, 2],
        [3, 4],
      ])
    ).toBe(true);
    expect(Matrix.isSquare([[1, 2, 3]])).toBe(false);
  });

  test("isIdentity", () => {
    expect(Matrix.isIdentity(Matrix.identity(3))).toBe(true);
    expect(
      Matrix.isIdentity([
        [1, 1],
        [0, 1],
      ])
    ).toBe(false);
  });

  test("isSymmetric", () => {
    expect(
      Matrix.isSymmetric([
        [1, 2],
        [2, 1],
      ])
    ).toBe(true);
    expect(
      Matrix.isSymmetric([
        [1, 2],
        [3, 1],
      ])
    ).toBe(false);
  });

  test("isDiagonal", () => {
    expect(Matrix.isDiagonal(Matrix.diagonal([1, 2]))).toBe(true);
    expect(
      Matrix.isDiagonal([
        [1, 2],
        [0, 1],
      ])
    ).toBe(false);
  });

  test("isUpperTriangular", () => {
    expect(
      Matrix.isUpperTriangular([
        [1, 2],
        [0, 3],
      ])
    ).toBe(true);
    expect(
      Matrix.isUpperTriangular([
        [1, 2],
        [3, 4],
      ])
    ).toBe(false);
  });

  test("isLowerTriangular", () => {
    expect(
      Matrix.isLowerTriangular([
        [1, 0],
        [2, 3],
      ])
    ).toBe(true);
    expect(
      Matrix.isLowerTriangular([
        [1, 2],
        [3, 4],
      ])
    ).toBe(false);
  });

  test("isOrthogonal", () => {
    expect(Matrix.isOrthogonal(Matrix.identity(2))).toBe(true);
    expect(
      Matrix.isOrthogonal(Matrix.round(Matrix.rotation2D(Math.PI / 4), 10))
    ).toBe(true);
  });

  test("isSingular", () => {
    expect(
      Matrix.isSingular([
        [1, 2],
        [2, 4],
      ])
    ).toBe(true);
    expect(
      Matrix.isSingular([
        [1, 2],
        [3, 4],
      ])
    ).toBe(false);
  });

  test("isZero", () => {
    expect(Matrix.isZero(Matrix.zeros(2, 2))).toBe(true);
    expect(
      Matrix.isZero([
        [0, 1],
        [0, 0],
      ])
    ).toBe(false);
  });

  test("isVector", () => {
    expect(Matrix.isVector([[1, 2, 3]])).toBe(true);
    expect(Matrix.isVector([[1], [2]])).toBe(true);
    expect(
      Matrix.isVector([
        [1, 2],
        [3, 4],
      ])
    ).toBe(false);
  });

  test("isRowVector", () => {
    expect(Matrix.isRowVector([[1, 2, 3]])).toBe(true);
    expect(Matrix.isRowVector([[1], [2]])).toBe(false);
  });

  test("isColumnVector", () => {
    expect(Matrix.isColumnVector([[1], [2], [3]])).toBe(true);
    expect(Matrix.isColumnVector([[1, 2]])).toBe(false);
  });

  test("equals", () => {
    expect(
      Matrix.equals(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 2],
          [3, 4],
        ]
      )
    ).toBe(true);
    expect(
      Matrix.equals(
        [
          [1, 2],
          [3, 4],
        ],
        [
          [1, 2],
          [3, 5],
        ]
      )
    ).toBe(false);
    expect(Matrix.equals([[1, 2]], [[1], [2]])).toBe(false);
  });
});

// ═══════════════════════════════════════
// VECTOR OPERATIONS
// ═══════════════════════════════════════
describe("Vector Operations", () => {
  test("dot product flat arrays", () => {
    expect(Matrix.dot([1, 2, 3], [4, 5, 6])).toBe(32);
  });

  test("dot product 2D arrays", () => {
    expect(Matrix.dot([[1, 2, 3]], [[4, 5, 6]])).toBe(32);
  });

  test("dot length mismatch throws RangeError", () => {
    expect(() => Matrix.dot([1, 2], [1, 2, 3])).toThrow(RangeError);
  });

  test("cross product", () => {
    expect(Matrix.cross([1, 0, 0], [0, 1, 0])).toEqual([0, 0, 1]);
  });

  test("cross non-3D throws RangeError", () => {
    expect(() => Matrix.cross([1, 2], [3, 4])).toThrow(RangeError);
  });

  test("magnitude", () => {
    expect(Matrix.magnitude([3, 4])).toBe(5);
  });

  test("normalize", () => {
    const n = Matrix.normalize([3, 4]);
    expect(n[0]).toBeCloseTo(0.6);
    expect(n[1]).toBeCloseTo(0.8);
  });

  test("normalize zero throws", () => {
    expect(() => Matrix.normalize([0, 0, 0])).toThrow();
  });

  test("angleBetween", () => {
    expect(Matrix.angleBetween([1, 0], [0, 1])).toBeCloseTo(Math.PI / 2);
  });
});

// ═══════════════════════════════════════
// AGGREGATION
// ═══════════════════════════════════════
describe("Aggregation", () => {
  const m = [
    [1, 2, 3],
    [4, 5, 6],
  ];

  test("rowSums", () => expect(Matrix.rowSums(m)).toEqual([[6], [15]]));
  test("colSums", () => expect(Matrix.colSums(m)).toEqual([[5, 7, 9]]));
  test("rowMeans", () => expect(Matrix.rowMeans(m)).toEqual([[2], [5]]));
  test("colMeans", () => expect(Matrix.colMeans(m)).toEqual([[2.5, 3.5, 4.5]]));
});

// ═══════════════════════════════════════
// FUNCTIONAL
// ═══════════════════════════════════════
describe("Functional Operations", () => {
  const m = [
    [1, 2],
    [3, 4],
  ];

  test("map", () => {
    expect(Matrix.map(m, (v) => v * 2)).toEqual([
      [2, 4],
      [6, 8],
    ]);
  });

  test("map with indices", () => {
    expect(Matrix.map(m, (v, i, j) => i * 10 + j)).toEqual([
      [0, 1],
      [10, 11],
    ]);
  });

  test("forEach", () => {
    const vals: number[] = [];
    Matrix.forEach(m, (v) => vals.push(v));
    expect(vals).toEqual([1, 2, 3, 4]);
  });

  test("every", () => {
    expect(Matrix.every(m, (v) => v > 0)).toBe(true);
    expect(Matrix.every(m, (v) => v > 2)).toBe(false);
  });

  test("some", () => {
    expect(Matrix.some(m, (v) => v > 3)).toBe(true);
    expect(Matrix.some(m, (v) => v > 10)).toBe(false);
  });

  test("round", () => {
    expect(Matrix.round([[1.234, 5.678]], 1)).toEqual([[1.2, 5.7]]);
  });

  test("abs", () => {
    expect(
      Matrix.abs([
        [-1, 2],
        [-3, 4],
      ])
    ).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });
});

// ═══════════════════════════════════════
// DISPLAY / UTILITY
// ═══════════════════════════════════════
describe("Display & Utility", () => {
  test("toString", () => {
    const s = Matrix.toString([
      [1, 2],
      [3, 4],
    ]);
    expect(s).toContain("1");
    expect(s).toContain("4");
    expect(s).toContain("┌");
    expect(s).toContain("└");
  });

  test("toHTML", () => {
    const html = Matrix.toHTML([
      [1, 2],
      [3, 4],
    ]);
    expect(html).toContain("<table");
    expect(html).toContain("<td>1</td>");
    expect(html).toContain("</table>");
  });

  test("toJSON / fromJSON roundtrip", () => {
    const m = [
      [1, 2],
      [3, 4],
    ];
    const json = Matrix.toJSON(m);
    expect(json).toHaveProperty("rows", 2);
    expect(json).toHaveProperty("cols", 2);
    expect(json).toHaveProperty("data");
    expect(Matrix.fromJSON(json)).toEqual(m);
  });
});

// ═══════════════════════════════════════
// INSTANCE / CHAINABLE API
// ═══════════════════════════════════════
describe("Instance (Chainable) API", () => {
  test("toArray returns plain array", () => {
    const m = new Matrix([
      [1, 2],
      [3, 4],
    ]);
    const arr = m.toArray();
    expect(arr).toEqual([
      [1, 2],
      [3, 4],
    ]);
    expect(Array.isArray(arr)).toBe(true);
  });

  test("chain arithmetic → toArray", () => {
    const result = new Matrix([
      [1, 2],
      [3, 4],
    ])
      .add([
        [10, 20],
        [30, 40],
      ])
      .scale(2)
      .toArray();
    expect(result).toEqual([
      [22, 44],
      [66, 88],
    ]);
  });

  test("chain transform → toArray", () => {
    const result = new Matrix([
      [1, 2],
      [3, 4],
    ])
      .transpose()
      .toArray();
    expect(result).toEqual([
      [1, 3],
      [2, 4],
    ]);
  });

  test("chain → terminal scalar", () => {
    const det = new Matrix([
      [1, 2],
      [3, 4],
    ]).determinant();
    expect(det).toBe(-2);
  });

  test("chain → terminal boolean", () => {
    expect(
      new Matrix([
        [1, 0],
        [0, 1],
      ]).isIdentity()
    ).toBe(true);
    expect(
      new Matrix([
        [1, 2],
        [3, 4],
      ]).isSquare()
    ).toBe(true);
  });

  test("chain structure ops", () => {
    const result = new Matrix([
      [1, 2],
      [3, 4],
    ])
      .hStack([[5], [6]])
      .toArray();
    expect(result).toEqual([
      [1, 2, 5],
      [3, 4, 6],
    ]);
  });

  test("chain swapRows", () => {
    expect(
      new Matrix([
        [1, 2],
        [3, 4],
      ])
        .swapRows(0, 1)
        .toArray()
    ).toEqual([
      [3, 4],
      [1, 2],
    ]);
  });

  test("chain swapCols", () => {
    expect(
      new Matrix([
        [1, 2],
        [3, 4],
      ])
        .swapCols(0, 1)
        .toArray()
    ).toEqual([
      [2, 1],
      [4, 3],
    ]);
  });

  test("chain slice", () => {
    expect(
      new Matrix([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ])
        .slice(0, 0, 2, 2)
        .toArray()
    ).toEqual([
      [1, 2],
      [4, 5],
    ]);
  });

  test("chain solve", () => {
    const x = new Matrix([
      [2, 1],
      [1, 3],
    ])
      .solve([[5], [10]])
      .toArray();
    expect(x[0][0]).toBeCloseTo(1);
    expect(x[1][0]).toBeCloseTo(3);
  });

  test("chain decomposition returns plain arrays", () => {
    const { L, U, P } = new Matrix([
      [2, 1],
      [4, 3],
    ]).lu();
    expect(Array.isArray(L)).toBe(true);
    expect(Array.isArray(U)).toBe(true);
    expect(Array.isArray(P)).toBe(true);
  });

  test("getShape, getRows, getCols, getSize", () => {
    const m = new Matrix([
      [1, 2, 3],
      [4, 5, 6],
    ]);
    expect(m.getShape()).toEqual([2, 3]);
    expect(m.getRows()).toBe(2);
    expect(m.getCols()).toBe(3);
    expect(m.getSize()).toBe(6);
  });

  test("getElement", () => {
    expect(
      new Matrix([
        [1, 2],
        [3, 4],
      ]).getElement(1, 1)
    ).toBe(4);
  });

  test("equals on instances", () => {
    const A = new Matrix([
      [1, 2],
      [3, 4],
    ]);
    const B = new Matrix([
      [1, 2],
      [3, 4],
    ]);
    const C = new Matrix([
      [1, 2],
      [3, 5],
    ]);
    expect(A.equals(B)).toBe(true);
    expect(A.equals(C)).toBe(false);
    expect(
      A.equals([
        [1, 2],
        [3, 4],
      ])
    ).toBe(true);
  });
});

// ═══════════════════════════════════════
// MATHEMATICAL PROPERTIES (EDGE CASES)
// ═══════════════════════════════════════
describe("Mathematical Properties", () => {
  test("A × I = A", () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ];
    const I = Matrix.identity(3);
    expect(Matrix.equals(Matrix.multiply(A, I), A)).toBe(true);
    expect(Matrix.equals(Matrix.multiply(I, A), A)).toBe(true);
  });

  test("A × A⁻¹ = I", () => {
    const A = [
      [1, 2, 3],
      [0, 1, 4],
      [5, 6, 0],
    ];
    const result = Matrix.round(Matrix.multiply(A, Matrix.inverse(A)), 10);
    expect(Matrix.isIdentity(result)).toBe(true);
  });

  test("det(A) = det(Aᵀ)", () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 10],
    ];
    expect(Matrix.determinant(A)).toBeCloseTo(
      Matrix.determinant(Matrix.transpose(A))
    );
  });

  test("det(AB) = det(A) × det(B)", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const B = [
      [5, 6],
      [7, 8],
    ];
    expect(Matrix.determinant(Matrix.multiply(A, B))).toBeCloseTo(
      Matrix.determinant(A) * Matrix.determinant(B)
    );
  });

  test("(AB)ᵀ = BᵀAᵀ", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const B = [
      [5, 6],
      [7, 8],
    ];
    const lhs = Matrix.transpose(Matrix.multiply(A, B));
    const rhs = Matrix.multiply(Matrix.transpose(B), Matrix.transpose(A));
    expect(Matrix.equals(lhs, rhs)).toBe(true);
  });

  test("1×1 matrix", () => {
    expect(Matrix.determinant([[42]])).toBe(42);
    expect(Matrix.trace([[42]])).toBe(42);
    expect(Matrix.inverse([[42]])[0][0]).toBeCloseTo(1 / 42);
  });

  test("immutability — static ops don't modify input", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const original = JSON.parse(JSON.stringify(A));

    Matrix.add(A, [
      [10, 20],
      [30, 40],
    ]);
    Matrix.scale(A, 100);
    Matrix.transpose(A);
    Matrix.negate(A);

    expect(A).toEqual(original);
  });
});

// ═══════════════════════════════════════
// ERROR TYPE VERIFICATION
// ═══════════════════════════════════════
describe("Error Types", () => {
  test("invalid input → TypeError", () => {
    expect(() => Matrix.fromArray([])).toThrow(TypeError);
    expect(() => Matrix.fromArray([[1, "a" as any]])).toThrow(TypeError);
    expect(() => Matrix.fromArray([[NaN]])).toThrow(TypeError);
    expect(() => Matrix.fromArray([[1, 2], [3]])).toThrow(TypeError);
  });

  test("invalid dimensions → RangeError", () => {
    expect(() => Matrix.create(0, 5)).toThrow(RangeError);
    expect(() => Matrix.create(-1, 5)).toThrow(RangeError);
    expect(() => Matrix.fromFlat([1, 2], 3, 3)).toThrow(RangeError);
    expect(() => Matrix.reshape([[1, 2, 3]], 2, 2)).toThrow(RangeError);
  });

  test("out of range index → RangeError", () => {
    expect(() => Matrix.get([[1, 2]], 5, 0)).toThrow(RangeError);
    expect(() => Matrix.swapRows([[1, 2]], 0, 5)).toThrow(RangeError);
    expect(() => Matrix.swapCols([[1, 2]], 0, 5)).toThrow(RangeError);
    expect(() => Matrix.slice([[1, 2]], 0, 0, 10, 10)).toThrow(RangeError);
  });

  test("non-square operation → RangeError", () => {
    expect(() => Matrix.determinant([[1, 2, 3]])).toThrow(RangeError);
    expect(() => Matrix.trace([[1, 2, 3]])).toThrow(RangeError);
    expect(() => Matrix.inverse([[1, 2, 3]])).toThrow(RangeError);
    expect(() => Matrix.power([[1, 2, 3]], 2)).toThrow(RangeError);
  });

  test("size mismatch → RangeError", () => {
    expect(() => Matrix.add([[1, 2]], [[1, 2, 3]])).toThrow(RangeError);
    expect(() => Matrix.multiply([[1, 2]], [[1, 2, 3]])).toThrow(RangeError);
    expect(() => Matrix.hStack([[1]], [[1], [2]])).toThrow(RangeError);
    expect(() => Matrix.vStack([[1, 2]], [[1, 2, 3]])).toThrow(RangeError);
  });

  test("singular matrix → Error (not RangeError)", () => {
    expect(() =>
      Matrix.inverse([
        [1, 2],
        [2, 4],
      ])
    ).toThrow(Error);
    expect(() =>
      Matrix.solve(
        [
          [1, 2],
          [2, 4],
        ],
        [3, 6]
      )
    ).toThrow(Error);
  });

  test("scale with non-number → TypeError", () => {
    expect(() => Matrix.scale([[1, 2]], "abc" as any)).toThrow(TypeError);
  });

  test("set with NaN → TypeError", () => {
    expect(() => Matrix.set([[1, 2]], 0, 0, NaN)).toThrow(TypeError);
  });

  test("cross product not 3D → RangeError", () => {
    expect(() => Matrix.cross([1, 2], [3, 4])).toThrow(RangeError);
  });

  test("dot product length mismatch → RangeError", () => {
    expect(() => Matrix.dot([1, 2], [1, 2, 3])).toThrow(RangeError);
  });
});
