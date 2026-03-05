import LinAlg from "../src/linalg";
import NDArray from "../src/ndarray";

const TOL = 1e-6;

function close(a: number, b: number, tol = TOL) {
  expect(Math.abs(a - b)).toBeLessThan(tol);
}

function matClose(A: number[][], B: number[][], tol = TOL) {
  expect(A.length).toBe(B.length);
  A.forEach((row, i) =>
    row.forEach((v, j) => {
      expect(Math.abs(v - B[i][j])).toBeLessThan(tol);
    })
  );
}

function arrClose(a: number[], b: number[], tol = TOL) {
  expect(a.length).toBe(b.length);
  a.forEach((v, i) => expect(Math.abs(v - b[i])).toBeLessThan(tol));
}

// ═══════════════════════════════════════════════════════════════════
// NORMS
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — norm", () => {
  const A = [
    [1, 2],
    [3, 4],
  ];

  test("Frobenius norm", () => {
    close(LinAlg.norm(A, "fro"), Math.sqrt(1 + 4 + 9 + 16)); // √30
  });

  test("1-norm (max abs col sum)", () => {
    close(LinAlg.norm(A, 1), 6); // col sums: 4, 6 → max=6
  });

  test("inf-norm (max abs row sum)", () => {
    close(LinAlg.norm(A, Infinity), 7); // row sums: 3, 7 → max=7
  });

  test("vector 2-norm", () => {
    close(LinAlg.norm([[3, 4]], 2), 5);
  });
});

// ═══════════════════════════════════════════════════════════════════
// DETERMINANT
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — det", () => {
  test("2×2", () => {
    close(
      LinAlg.det([
        [1, 2],
        [3, 4],
      ]),
      -2
    );
  });

  test("3×3", () => {
    close(
      LinAlg.det([
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 10],
      ]),
      -3
    );
  });

  test("identity n=3 → 1", () => {
    close(
      LinAlg.det([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ]),
      1
    );
  });

  test("singular matrix → 0", () => {
    close(
      LinAlg.det([
        [1, 2],
        [2, 4],
      ]),
      0
    );
  });
});

// ═══════════════════════════════════════════════════════════════════
// INVERSE
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — inv", () => {
  test("inv([[2,0],[0,4]]) is diag(0.5, 0.25)", () => {
    const Inv = LinAlg.inv([
      [2, 0],
      [0, 4],
    ]).toList() as number[][];
    close(Inv[0][0], 0.5);
    close(Inv[1][1], 0.25);
    close(Inv[0][1], 0);
    close(Inv[1][0], 0);
  });

  test("A @ inv(A) ≈ I", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const AI = LinAlg._inv(A);
    const I = [
      [
        A[0][0] * AI[0][0] + A[0][1] * AI[1][0],
        A[0][0] * AI[0][1] + A[0][1] * AI[1][1],
      ],
      [
        A[1][0] * AI[0][0] + A[1][1] * AI[1][0],
        A[1][0] * AI[0][1] + A[1][1] * AI[1][1],
      ],
    ];
    close(I[0][0], 1);
    close(I[0][1], 0);
    close(I[1][0], 0);
    close(I[1][1], 1);
  });

  test("singular matrix throws", () => {
    expect(() =>
      LinAlg.inv([
        [1, 2],
        [2, 4],
      ])
    ).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════
// SOLVE
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — solve", () => {
  test("2×2 system", () => {
    // 2x + y = 5, x + 3y = 10  →  x=1, y=3
    const x = LinAlg.solve(
      [
        [2, 1],
        [1, 3],
      ],
      [5, 10]
    );
    arrClose(Array.from(x.toArray()), [1, 3]);
  });

  test("3×3 system", () => {
    const x = LinAlg.solve(
      [
        [1, 0, 0],
        [0, 2, 0],
        [0, 0, 3],
      ],
      [1, 4, 9]
    );
    arrClose(Array.from(x.toArray()), [1, 2, 3]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// CHOLESKY
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — cholesky", () => {
  test("L @ L^T reconstructs A", () => {
    const A = [
      [4, 2],
      [2, 3],
    ];
    const { L } = LinAlg.cholesky(A);
    const Lm = L.toList() as number[][];
    // A = L @ L^T
    const A00 = Lm[0][0] ** 2 + Lm[0][1] ** 2;
    const A01 = Lm[1][0] * Lm[0][0] + Lm[1][1] * Lm[0][1];
    const A11 = Lm[1][0] ** 2 + Lm[1][1] ** 2;
    close(A00, A[0][0]);
    close(A01, A[0][1]);
    close(A11, A[1][1]);
  });

  test("non-positive-definite throws", () => {
    expect(() =>
      LinAlg.cholesky([
        [1, 2],
        [2, 1],
      ])
    ).toThrow();
  });
});

// ═══════════════════════════════════════════════════════════════════
// SVD
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — svd", () => {
  test("singular values of [[1,0],[0,2]] are [2,1]", () => {
    const { S } = LinAlg.svd(
      [
        [1, 0],
        [0, 2],
      ],
      false
    );
    const sigma = Array.from(S.toArray()).sort((a, b) => b - a);
    close(sigma[0], 2, 1e-5);
    close(sigma[1], 1, 1e-5);
  });

  test("U @ diag(S) @ Vh ≈ A", () => {
    const A = [
      [3, 1],
      [1, 3],
    ];
    const { U, S, Vh } = LinAlg.svd(A, false);
    const Um = U.toList() as number[][];
    const sigma = Array.from(S.toArray());
    const Vhm = Vh.toList() as number[][];
    const k = sigma.length;
    const Ar: number[][] = [
      [0, 0],
      [0, 0],
    ];
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++)
        for (let l = 0; l < k; l++) Ar[i][j] += Um[i][l] * sigma[l] * Vhm[l][j];
    close(Ar[0][0], A[0][0], 1e-4);
    close(Ar[0][1], A[0][1], 1e-4);
    close(Ar[1][0], A[1][0], 1e-4);
    close(Ar[1][1], A[1][1], 1e-4);
  });
});

// ═══════════════════════════════════════════════════════════════════
// PSEUDO-INVERSE
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — pinv", () => {
  test("pinv of diagonal matrix", () => {
    const A = [
      [2, 0],
      [0, 4],
    ];
    const Ap = LinAlg.pinv(A).toList() as number[][];
    close(Ap[0][0], 0.5, 1e-4);
    close(Ap[1][1], 0.25, 1e-4);
  });

  test("A @ pinv(A) ≈ I for diagonal invertible matrix", () => {
    const A = [
      [3, 0],
      [0, 5],
    ];
    const Ap = LinAlg.pinv(A).toList() as number[][];
    // A @ Ap should ≈ I for diagonal invertible
    const r00 = A[0][0] * Ap[0][0] + A[0][1] * Ap[1][0];
    const r11 = A[1][0] * Ap[0][1] + A[1][1] * Ap[1][1];
    close(r00, 1, 1e-4);
    close(r11, 1, 1e-4);
  });
});

// ═══════════════════════════════════════════════════════════════════
// CONDITION NUMBER
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — cond", () => {
  test("identity has cond=1", () => {
    close(
      LinAlg.cond([
        [1, 0],
        [0, 1],
      ]),
      1,
      1e-4
    );
  });

  test("diagonal with large spread has high cond", () => {
    const k = LinAlg.cond([
      [1, 0],
      [0, 1000],
    ]);
    expect(k).toBeGreaterThan(500);
  });
});

// ═══════════════════════════════════════════════════════════════════
// EIGENVALUES
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — eig (symmetric)", () => {
  test("diagonal matrix eigenvalues", () => {
    const { values } = LinAlg.eig([
      [3, 0],
      [0, 7],
    ]);
    const vals = Array.from(values.toArray()).sort((a, b) => b - a);
    close(vals[0], 7, 1e-4);
    close(vals[1], 3, 1e-4);
  });

  test("[[2,1],[1,2]] eigenvalues are 3 and 1", () => {
    const { values } = LinAlg.eig([
      [2, 1],
      [1, 2],
    ]);
    const vals = Array.from(values.toArray()).sort((a, b) => b - a);
    close(vals[0], 3, 1e-4);
    close(vals[1], 1, 1e-4);
  });
});

// ═══════════════════════════════════════════════════════════════════
// QR DECOMPOSITION
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — qr", () => {
  test("Q is orthogonal (Q^T @ Q ≈ I)", () => {
    const { Q } = LinAlg.qr([
      [1, 2],
      [3, 4],
      [5, 6],
    ]);
    const Qm = Q.toList() as number[][];
    const Qt = Qm[0].map((_, ci) => Qm.map((row) => row[ci]));
    const QtQ = Qt.map((row) =>
      Qt[0].map((_, ci) => row.reduce((s, v, ri) => s + v * Qm[ri][ci], 0))
    );
    close(QtQ[0][0], 1, 1e-5);
    close(QtQ[0][1], 0, 1e-5);
    close(QtQ[1][1], 1, 1e-5);
  });

  test("Q @ R ≈ A", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const { Q, R } = LinAlg.qr(A);
    const Qm = Q.toList() as number[][];
    const Rm = R.toList() as number[][];
    for (let i = 0; i < 2; i++)
      for (let j = 0; j < 2; j++) {
        const v = Qm[i].reduce((s, q, k) => s + q * Rm[k][j], 0);
        close(v, A[i][j], 1e-5);
      }
  });
});

// ═══════════════════════════════════════════════════════════════════
// LU DECOMPOSITION
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — lu", () => {
  test("L is lower triangular", () => {
    const { L } = LinAlg.lu([
      [2, 1],
      [4, 3],
    ]);
    const Lm = L.toList() as number[][];
    expect(Lm[0][1]).toBe(0);
  });

  test("U is upper triangular", () => {
    const { U } = LinAlg.lu([
      [2, 1],
      [4, 3],
    ]);
    const Um = U.toList() as number[][];
    close(Um[1][0], 0, 1e-10);
  });
});

// ═══════════════════════════════════════════════════════════════════
// TRACE
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — trace", () => {
  test("trace of [[1,2],[3,4]] = 5", () => {
    close(
      LinAlg.trace([
        [1, 2],
        [3, 4],
      ]),
      5
    );
  });
});

// ═══════════════════════════════════════════════════════════════════
// KRONECKER PRODUCT
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — kron", () => {
  test("kron([[1,0],[0,1]], A) = block-diag A,A", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const I = [
      [1, 0],
      [0, 1],
    ];
    const K = LinAlg.kron(I, A).toList() as number[][];
    expect(K.length).toBe(4);
    expect(K[0]).toEqual([1, 2, 0, 0]);
    expect(K[3]).toEqual([0, 0, 3, 4]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// LEAST SQUARES
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — lstsq", () => {
  test("exact solution for diagonal square system", () => {
    const { solution } = LinAlg.lstsq(
      [
        [2, 0],
        [0, 3],
      ],
      [4, 9]
    );
    arrClose(Array.from(solution.toArray()), [2, 3], 1e-4);
  });

  test("over-determined system returns best fit", () => {
    // y = 2x: points (0,0),(1,2),(2,4),(3,6)
    const A = [[0], [1], [2], [3]];
    const b = [0, 2, 4, 6];
    const { solution, rank } = LinAlg.lstsq(A, b);
    close(solution.item(0), 2, 1e-4);
    expect(rank).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════
// MATRIX RANK
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — matrixRank", () => {
  test("full rank 2×2", () => {
    expect(
      LinAlg.matrixRank([
        [1, 0],
        [0, 1],
      ])
    ).toBe(2);
  });

  test("rank-deficient matrix (zero row)", () => {
    expect(
      LinAlg.matrixRank([
        [1, 0],
        [0, 0],
      ])
    ).toBe(1);
  });
});

// ═══════════════════════════════════════════════════════════════════
// TRIANGLE SOLVE
// ═══════════════════════════════════════════════════════════════════
describe("LinAlg — solveLower / solveUpper", () => {
  test("solveLower Lx=b", () => {
    const L = [
      [1, 0, 0],
      [2, 1, 0],
      [3, 4, 1],
    ];
    const b = [1, 4, 10];
    const x = LinAlg.solveLower(L, b);
    // Verify Lx ≈ b
    const xArr = Array.from(x.toArray());
    const r0 = L[0][0] * xArr[0];
    const r1 = L[1][0] * xArr[0] + L[1][1] * xArr[1];
    const r2 = L[2][0] * xArr[0] + L[2][1] * xArr[1] + L[2][2] * xArr[2];
    close(r0, b[0]);
    close(r1, b[1]);
    close(r2, b[2]);
  });

  test("solveUpper Ux=b", () => {
    const U = [
      [2, 3],
      [0, 4],
    ];
    const b = [8, 8];
    const x = LinAlg.solveUpper(U, b);
    arrClose(Array.from(x.toArray()), [1, 2], 1e-5);
  });
});
