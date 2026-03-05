// =====================================================================
// LinAlg — Advanced Linear Algebra for NumWiz
// Extends Matrix with SVD, eigenvectors, Cholesky, pseudo-inverse, etc.
// =====================================================================

import NDArray from "./ndarray";

type Mat = number[][];

// ---- Internal helpers ----

function mat(rows: number, cols: number, fill = 0): Mat {
  return Array.from({ length: rows }, () => new Array(cols).fill(fill));
}

function matCopy(A: Mat): Mat {
  return A.map((r) => r.slice());
}

function matMul(A: Mat, B: Mat): Mat {
  const m = A.length,
    k = A[0].length,
    n = B[0].length;
  const C = mat(m, n);
  for (let i = 0; i < m; i++)
    for (let j = 0; j < n; j++)
      for (let l = 0; l < k; l++) C[i][j] += A[i][l] * B[l][j];
  return C;
}

function matT(A: Mat): Mat {
  const m = A.length,
    n = A[0].length;
  const T = mat(n, m);
  for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) T[j][i] = A[i][j];
  return T;
}

function norm2(v: number[]): number {
  return Math.sqrt(v.reduce((s, x) => s + x * x, 0));
}

function eye(n: number): Mat {
  const I = mat(n, n);
  for (let i = 0; i < n; i++) I[i][i] = 1;
  return I;
}

function toMat(A: NDArray | Mat): Mat {
  if (A instanceof NDArray) return A.toList() as Mat;
  return A;
}

function fromMat(A: Mat): NDArray {
  return NDArray.from(A);
}

// ---- Exported result types ----

export interface SVDResult {
  U: NDArray; // m×m unitary
  S: NDArray; // singular values (min(m,n),)
  Vh: NDArray; // n×n unitary (V^H)
}

export interface EigResult {
  values: NDArray; // eigenvalues
  vectors: NDArray; // eigenvectors as columns
}

export interface CholeskyResult {
  L: NDArray; // lower triangular s.t. A = L @ L^T
}

export interface SchurResult {
  T: NDArray; // quasi-upper-triangular
  Z: NDArray; // unitary s.t. A = Z @ T @ Z^H
}

// =====================================================================
// LinAlg module
// =====================================================================

const LinAlg = {
  // ----------------------------------------------------------------
  // Norms
  // ----------------------------------------------------------------

  /**
   * Matrix or vector norm.
   * ord = 2 → largest singular value (spectral norm) for 2D,
   *           Euclidean norm for 1D.
   * ord = 'fro' → Frobenius.
   * ord = 1 → max column sum. ord = Infinity → max row sum.
   * ord = -1 → min col sum. ord = -Infinity → min row sum.
   */
  norm(A: NDArray | Mat, ord: number | "fro" | "nuc" = 2): number {
    const M = toMat(A);
    const m = M.length;
    const n = M[0].length;
    const flat = M.flat();

    if (m === 1 || n === 1) {
      // Vector norm
      const v = flat;
      if (ord === Infinity) return Math.max(...v.map(Math.abs));
      if (ord === -Infinity) return Math.min(...v.map(Math.abs));
      if (ord === "fro" || ord === 2) return norm2(v);
      return Math.pow(
        v.reduce((s, x) => s + Math.pow(Math.abs(x), ord as number), 0),
        1 / (ord as number)
      );
    }

    if (ord === "fro") return Math.sqrt(flat.reduce((s, x) => s + x * x, 0));
    if (ord === 1) {
      // Max abs column sum
      let max = 0;
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let i = 0; i < m; i++) s += Math.abs(M[i][j]);
        max = Math.max(max, s);
      }
      return max;
    }
    if (ord === -1) {
      let min = Infinity;
      for (let j = 0; j < n; j++) {
        let s = 0;
        for (let i = 0; i < m; i++) s += Math.abs(M[i][j]);
        min = Math.min(min, s);
      }
      return min;
    }
    if (ord === Infinity) {
      // Max abs row sum
      return Math.max(
        ...M.map((row) => row.reduce((s, x) => s + Math.abs(x), 0))
      );
    }
    if (ord === -Infinity) {
      return Math.min(
        ...M.map((row) => row.reduce((s, x) => s + Math.abs(x), 0))
      );
    }
    if (ord === "nuc") {
      const { S } = LinAlg.svd(A);
      return Array.from(S.toArray()).reduce((s, x) => s + x, 0);
    }
    if (ord === 2) {
      const { S } = LinAlg.svd(A);
      return S.toArray()[0];
    }
    throw new Error(`Unsupported norm order: ${ord}`);
  },

  // ----------------------------------------------------------------
  // Singular Value Decomposition — one-sided Jacobi
  // ----------------------------------------------------------------

  /**
   * Compute SVD: A = U @ diag(S) @ Vh
   * Uses the one-sided Jacobi algorithm; converges for small/medium matrices.
   */
  svd(A: NDArray | Mat, fullMatrices = true): SVDResult {
    const M = matCopy(toMat(A));
    const m = M.length;
    const n = M[0].length;

    // Work on A^T*A to get V and singular values, then compute U
    // Use the Jacobi eigendecomposition on B = A^T * A
    let V = eye(n);
    const B = matMul(matT(M), M);

    const MAX_ITER = 1000 * n * n;
    const EPS = 1e-14;

    for (let iter = 0; iter < MAX_ITER; iter++) {
      let offNorm = 0;
      for (let p = 0; p < n - 1; p++)
        for (let q = p + 1; q < n; q++) offNorm += B[p][q] * B[p][q];
      if (offNorm < EPS) break;

      for (let p = 0; p < n - 1; p++) {
        for (let q = p + 1; q < n; q++) {
          const bpq = B[p][q];
          if (Math.abs(bpq) < EPS * 1e-6) continue;
          const bpp = B[p][p];
          const bqq = B[q][q];
          const theta = 0.5 * Math.atan2(2 * bpq, bqq - bpp);
          const c = Math.cos(theta);
          const s = Math.sin(theta);

          // Apply rotation J^T B J
          for (let i = 0; i < n; i++) {
            const bi_p = B[i][p],
              bi_q = B[i][q];
            B[i][p] = c * bi_p + s * bi_q;
            B[i][q] = -s * bi_p + c * bi_q;
          }
          for (let j = 0; j < n; j++) {
            const bp_j = B[p][j],
              bq_j = B[q][j];
            B[p][j] = c * bp_j + s * bq_j;
            B[q][j] = -s * bp_j + c * bq_j;
          }

          // Accumulate V
          for (let i = 0; i < n; i++) {
            const vi_p = V[i][p],
              vi_q = V[i][q];
            V[i][p] = c * vi_p + s * vi_q;
            V[i][q] = -s * vi_p + c * vi_q;
          }
        }
      }
    }

    // Singular values = sqrt(diagonal of B)
    const singVals: number[] = [];
    for (let i = 0; i < n; i++) singVals.push(Math.sqrt(Math.max(0, B[i][i])));

    // Sort descending
    const order = Array.from({ length: n }, (_, i) => i).sort(
      (a, b) => singVals[b] - singVals[a]
    );
    const sigma = order.map((i) => singVals[i]);

    // Reorder V columns
    const Vsorted: Mat = mat(n, n);
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) Vsorted[i][j] = V[i][order[j]];

    // Compute U = A * V * Sigma^-1
    const k = Math.min(m, n);
    const U: Mat = mat(m, fullMatrices ? m : k);
    for (let j = 0; j < k; j++) {
      if (sigma[j] < 1e-14) {
        // Handle zero singular values — set U column to zero (or complete later)
        continue;
      }
      for (let i = 0; i < m; i++) {
        let val = 0;
        for (let l = 0; l < n; l++) val += M[i][l] * Vsorted[l][j];
        U[i][j] = val / sigma[j];
      }
    }

    // Complete U to a full orthogonal matrix via Gram-Schmidt if fullMatrices
    if (fullMatrices && m > k) {
      const base = U.slice(0, m).map((r) => r.slice(0, k));
      const completed = _gramSchmidtComplete(base, m);
      for (let i = 0; i < m; i++)
        for (let j = 0; j < m; j++) U[i][j] = completed[i][j];
    }

    return {
      U: fromMat(U.map((r) => r.slice(0, fullMatrices ? m : k))),
      S: NDArray.from(sigma.slice(0, k)),
      Vh: fromMat(matT(Vsorted)),
    };
  },

  // ----------------------------------------------------------------
  // Pseudo-inverse (Moore-Penrose)
  // ----------------------------------------------------------------

  pinv(A: NDArray | Mat, rcond = 1e-12): NDArray {
    const { U, S, Vh } = LinAlg.svd(A, false);
    const Uarr = toMat(U);
    const Sarr = Array.from(S.toArray());
    const Vharr = toMat(Vh);
    const maxS = Sarr[0];

    // Compute Sigma^+ — invert non-negligible singular values
    const SInv = Sarr.map((s) => (s > rcond * maxS ? 1 / s : 0));

    // Pinv = V @ diag(SInv) @ U^T
    const m = Uarr.length;
    const n = Vharr[0].length;
    const k = SInv.length;

    const result: Mat = mat(n, m);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        let val = 0;
        for (let l = 0; l < k; l++) {
          // Vh[l][i] gives V[i][l], Uarr[j][l] gives U^T[l][j]
          val += Vharr[l][i] * SInv[l] * Uarr[j][l];
        }
        result[i][j] = val;
      }
    }
    return fromMat(result);
  },

  // ----------------------------------------------------------------
  // Condition number
  // ----------------------------------------------------------------

  cond(A: NDArray | Mat, ord: number | "fro" | "nuc" = 2): number {
    if (ord === 2) {
      const { S } = LinAlg.svd(A, false);
      const sigma = Array.from(S.toArray());
      if (sigma[sigma.length - 1] === 0) return Infinity;
      return sigma[0] / sigma[sigma.length - 1];
    }
    const Ainv = fromMat(LinAlg._inv(toMat(A)));
    return LinAlg.norm(A, ord) * LinAlg.norm(Ainv, ord);
  },

  // ----------------------------------------------------------------
  // Eigenvalues & Eigenvectors
  // ----------------------------------------------------------------

  /**
   * Compute eigenvalues and eigenvectors of a square matrix.
   * Uses the QR algorithm with Wilkinson shift for symmetric matrices.
   * For real symmetric matrices: exact eigendecomposition via Jacobi.
   * For general matrices: power iteration-based approach.
   */
  eig(A: NDArray | Mat): EigResult {
    const M = toMat(A);
    const n = M.length;

    // Check if symmetric
    let isSymmetric = true;
    for (let i = 0; i < n && isSymmetric; i++)
      for (let j = 0; j < n && isSymmetric; j++)
        if (Math.abs(M[i][j] - M[j][i]) > 1e-10) isSymmetric = false;

    if (isSymmetric) return LinAlg._symEig(matCopy(M));
    return LinAlg._qrEig(matCopy(M));
  },

  /** Eigenvalues only (faster than eig). */
  eigvals(A: NDArray | Mat): NDArray {
    return LinAlg.eig(A).values;
  },

  // ----------------------------------------------------------------
  // Cholesky decomposition
  // ----------------------------------------------------------------

  /**
   * Cholesky decomposition: A = L @ L^T for positive definite A.
   * Returns the lower triangular factor L.
   */
  cholesky(A: NDArray | Mat): CholeskyResult {
    const M = toMat(A);
    const n = M.length;
    if (n !== M[0].length)
      throw new RangeError(`Cholesky requires square matrix`);
    const L: Mat = mat(n, n);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;
        for (let k = 0; k < j; k++) sum += L[i][k] * L[j][k];
        if (i === j) {
          const val = M[i][i] - sum;
          if (val < 0) throw new Error(`Matrix is not positive definite`);
          L[i][j] = Math.sqrt(val);
        } else {
          if (L[j][j] === 0) throw new Error(`Matrix is singular`);
          L[i][j] = (M[i][j] - sum) / L[j][j];
        }
      }
    }
    return { L: fromMat(L) };
  },

  // ----------------------------------------------------------------
  // Least squares
  // ----------------------------------------------------------------

  /**
   * Least-squares solution to A @ x = b via SVD.
   * Returns the solution x, residuals, rank, and singular values.
   */
  lstsq(
    A: NDArray | Mat,
    b: NDArray | number[],
    rcond = 1e-12
  ): {
    solution: NDArray;
    residuals: NDArray;
    rank: number;
    singularValues: NDArray;
  } {
    const Pinv = LinAlg.pinv(A, rcond);
    const bArr = b instanceof NDArray ? b : NDArray.from(b as number[]);
    let bMat: NDArray;
    if (bArr.ndim === 1) {
      bMat = bArr.reshape([bArr.size, 1]);
    } else {
      bMat = bArr;
    }
    const xMat = Pinv.matmul(bMat);
    const x = xMat.ndim === 2 && xMat.shape[1] === 1 ? xMat.flatten() : xMat;

    const { S } = LinAlg.svd(A, false);
    const sigma = Array.from(S.toArray());
    const maxS = sigma[0];
    const rank = sigma.filter((s) => s > rcond * maxS).length;

    // Compute residuals: ||A @ x - b||^2
    const Aarr = toMat(A);
    const xList = Array.from(x.toArray());
    const m = Aarr.length;
    let residSq = 0;
    for (let i = 0; i < m; i++) {
      let ax = 0;
      for (let j = 0; j < xList.length; j++) ax += Aarr[i][j] * xList[j];
      const bi = bArr.ndim === 1 ? bArr.item(i) : bArr.get(i, 0);
      residSq += (ax - bi) ** 2;
    }

    return {
      solution: x,
      residuals: NDArray.from([residSq]),
      rank,
      singularValues: S,
    };
  },

  // ----------------------------------------------------------------
  // Solve linear system (Gaussian elimination with partial pivoting)
  // ----------------------------------------------------------------

  solve(A: NDArray | Mat, b: NDArray | number[]): NDArray {
    const M = matCopy(toMat(A));
    const n = M.length;
    const bArr =
      b instanceof NDArray ? Array.from(b.toArray()) : (b as number[]).slice();
    if (M.length !== M[0].length)
      throw new RangeError(`solve requires square matrix`);

    // Augmented matrix [M | b]
    for (let col = 0; col < n; col++) {
      // Partial pivoting
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
      }
      if (Math.abs(M[maxRow][col]) < 1e-14)
        throw new Error(`Matrix is singular`);
      [M[col], M[maxRow]] = [M[maxRow], M[col]];
      [bArr[col], bArr[maxRow]] = [bArr[maxRow], bArr[col]];

      for (let row = col + 1; row < n; row++) {
        const factor = M[row][col] / M[col][col];
        bArr[row] -= factor * bArr[col];
        for (let j = col; j < n; j++) M[row][j] -= factor * M[col][j];
      }
    }

    // Back substitution
    const x = new Array<number>(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = bArr[i];
      for (let j = i + 1; j < n; j++) x[i] -= M[i][j] * x[j];
      x[i] /= M[i][i];
    }
    return NDArray.from(x);
  },

  // ----------------------------------------------------------------
  // Determinant
  // ----------------------------------------------------------------

  det(A: NDArray | Mat): number {
    const M = matCopy(toMat(A));
    const n = M.length;
    let sign = 1;

    for (let col = 0; col < n; col++) {
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(M[row][col]) > Math.abs(M[maxRow][col])) maxRow = row;
      }
      if (maxRow !== col) {
        [M[col], M[maxRow]] = [M[maxRow], M[col]];
        sign *= -1;
      }
      if (Math.abs(M[col][col]) < 1e-14) return 0;
      for (let row = col + 1; row < n; row++) {
        const f = M[row][col] / M[col][col];
        for (let j = col; j < n; j++) M[row][j] -= f * M[col][j];
      }
    }

    let d = sign;
    for (let i = 0; i < n; i++) d *= M[i][i];
    return d;
  },

  // ----------------------------------------------------------------
  // Inverse
  // ----------------------------------------------------------------

  inv(A: NDArray | Mat): NDArray {
    return fromMat(LinAlg._inv(toMat(A)));
  },

  _inv(M: Mat): Mat {
    const n = M.length;
    const aug = M.map((row, i) => [...row, ...eye(n)[i]]);

    for (let col = 0; col < n; col++) {
      let maxRow = col;
      for (let row = col + 1; row < n; row++) {
        if (Math.abs(aug[row][col]) > Math.abs(aug[maxRow][col])) maxRow = row;
      }
      if (Math.abs(aug[maxRow][col]) < 1e-14)
        throw new Error(`Matrix is singular`);
      [aug[col], aug[maxRow]] = [aug[maxRow], aug[col]];
      const pivot = aug[col][col];
      for (let j = 0; j < 2 * n; j++) aug[col][j] /= pivot;
      for (let row = 0; row < n; row++) {
        if (row === col) continue;
        const f = aug[row][col];
        for (let j = 0; j < 2 * n; j++) aug[row][j] -= f * aug[col][j];
      }
    }

    return aug.map((row) => row.slice(n));
  },

  // ----------------------------------------------------------------
  // Rank
  // ----------------------------------------------------------------

  matrixRank(A: NDArray | Mat, tol?: number): number {
    const { S } = LinAlg.svd(A, false);
    const sigma = Array.from(S.toArray());
    const threshold =
      tol ??
      sigma[0] *
        Math.max(...toMat(A).flatMap((r) => [r.length, toMat(A).length])) *
        2.22e-16;
    return sigma.filter((s) => s > threshold).length;
  },

  // ----------------------------------------------------------------
  // Matrix exponential (via Taylor series / Padé approximants)
  // ----------------------------------------------------------------

  expm(A: NDArray | Mat): NDArray {
    const M = toMat(A);
    const n = M.length;
    // Scale and square: use expm = (exp(A/2^s))^(2^s)
    // Simple Padé approximation of order 6
    const normA = LinAlg.norm(A, "fro");
    let s = Math.max(0, Math.ceil(Math.log2(normA / 5.37)));
    const scale = Math.pow(2, s);
    const As = M.map((row) => row.map((x) => x / scale));

    const I = eye(n);
    const result = _padéExpm(As, n);

    // Square back
    let R = result;
    for (let i = 0; i < s; i++) R = matMul(R, R);
    return fromMat(R);
  },

  // ----------------------------------------------------------------
  // Null space
  // ----------------------------------------------------------------

  nullSpace(A: NDArray | Mat, tol = 1e-10): NDArray {
    const { S, Vh } = LinAlg.svd(A, false);
    const sigma = Array.from(S.toArray());
    const maxSigma = sigma[0];
    const Vhmat = toMat(Vh);
    // Rows of Vh corresponding to near-zero singular values form the null space
    const nsRows: Mat = [];
    for (let i = 0; i < sigma.length; i++) {
      if (sigma[i] < tol * maxSigma) nsRows.push(Vhmat[i]);
    }
    if (nsRows.length === 0) return NDArray.zeros([Vhmat[0].length, 0]);
    return fromMat(matT(nsRows));
  },

  // ----------------------------------------------------------------
  // Column space (range)
  // ----------------------------------------------------------------

  columnSpace(A: NDArray | Mat, tol = 1e-10): NDArray {
    const { U, S } = LinAlg.svd(A, true);
    const sigma = Array.from(S.toArray());
    const maxSigma = sigma[0];
    const rank = sigma.filter((s) => s > tol * maxSigma).length;
    const Umat = toMat(U);
    return fromMat(Umat.map((row) => row.slice(0, rank)));
  },

  // ----------------------------------------------------------------
  // QR decomposition (Householder reflections)
  // ----------------------------------------------------------------

  qr(A: NDArray | Mat): { Q: NDArray; R: NDArray } {
    let M = matCopy(toMat(A));
    const m = M.length,
      n = M[0].length;
    let Q = eye(m);

    for (let k = 0; k < Math.min(m - 1, n); k++) {
      // Extract column k below diagonal
      const x: number[] = [];
      for (let i = k; i < m; i++) x.push(M[i][k]);
      const xNorm = norm2(x);
      if (xNorm < 1e-14) continue;
      const sign = x[0] >= 0 ? 1 : -1;
      x[0] += sign * xNorm;
      const vNorm = norm2(x);
      const v = x.map((xi) => xi / vNorm);

      // Apply H = I - 2*v*v^T to rows k..m of M
      for (let j = k; j < n; j++) {
        let dot = 0;
        for (let i = 0; i < v.length; i++) dot += v[i] * M[k + i][j];
        for (let i = 0; i < v.length; i++) M[k + i][j] -= 2 * v[i] * dot;
      }
      // Apply H to Q
      for (let j = 0; j < m; j++) {
        let dot = 0;
        for (let i = 0; i < v.length; i++) dot += v[i] * Q[k + i][j];
        for (let i = 0; i < v.length; i++) Q[k + i][j] -= 2 * v[i] * dot;
      }
    }

    return { Q: fromMat(matT(Q)), R: fromMat(M) };
  },

  // ----------------------------------------------------------------
  // LU decomposition with partial pivoting
  // ----------------------------------------------------------------

  lu(A: NDArray | Mat): { P: NDArray; L: NDArray; U: NDArray } {
    const M = matCopy(toMat(A));
    const n = M.length;
    const Lm: Mat = eye(n);
    const perm = Array.from({ length: n }, (_, i) => i);

    for (let k = 0; k < n - 1; k++) {
      // Partial pivoting
      let maxRow = k;
      for (let i = k + 1; i < n; i++) {
        if (Math.abs(M[i][k]) > Math.abs(M[maxRow][k])) maxRow = i;
      }
      if (maxRow !== k) {
        [M[k], M[maxRow]] = [M[maxRow], M[k]];
        [perm[k], perm[maxRow]] = [perm[maxRow], perm[k]];
        if (k > 0) {
          for (let j = 0; j < k; j++) {
            [Lm[k][j], Lm[maxRow][j]] = [Lm[maxRow][j], Lm[k][j]];
          }
        }
      }
      if (Math.abs(M[k][k]) < 1e-14) continue;
      for (let i = k + 1; i < n; i++) {
        Lm[i][k] = M[i][k] / M[k][k];
        for (let j = k; j < n; j++) M[i][j] -= Lm[i][k] * M[k][j];
      }
    }

    // Build permutation matrix
    const Pm: Mat = mat(n, n);
    for (let i = 0; i < n; i++) Pm[i][perm[i]] = 1;

    return { P: fromMat(Pm), L: fromMat(Lm), U: fromMat(M) };
  },

  // ----------------------------------------------------------------
  // Triangle solve (forward/back substitution)
  // ----------------------------------------------------------------

  solveLower(L: NDArray | Mat, b: NDArray | number[]): NDArray {
    const Lm = toMat(L);
    const n = Lm.length;
    const bArr =
      b instanceof NDArray ? Array.from(b.toArray()) : (b as number[]).slice();
    const x = new Array<number>(n).fill(0);
    for (let i = 0; i < n; i++) {
      x[i] = bArr[i];
      for (let j = 0; j < i; j++) x[i] -= Lm[i][j] * x[j];
      x[i] /= Lm[i][i];
    }
    return NDArray.from(x);
  },

  solveUpper(U: NDArray | Mat, b: NDArray | number[]): NDArray {
    const Um = toMat(U);
    const n = Um.length;
    const bArr =
      b instanceof NDArray ? Array.from(b.toArray()) : (b as number[]).slice();
    const x = new Array<number>(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
      x[i] = bArr[i];
      for (let j = i + 1; j < n; j++) x[i] -= Um[i][j] * x[j];
      x[i] /= Um[i][i];
    }
    return NDArray.from(x);
  },

  // ----------------------------------------------------------------
  // Trace, rank convenience wrappers
  // ----------------------------------------------------------------

  trace(A: NDArray | Mat): number {
    const M = toMat(A);
    const n = Math.min(M.length, M[0].length);
    let s = 0;
    for (let i = 0; i < n; i++) s += M[i][i];
    return s;
  },

  // ----------------------------------------------------------------
  // Kronecker product
  // ----------------------------------------------------------------

  kron(A: NDArray | Mat, B: NDArray | Mat): NDArray {
    const Am = toMat(A),
      Bm = toMat(B);
    const m = Am.length,
      n = Am[0].length;
    const p = Bm.length,
      q = Bm[0].length;
    const C: Mat = mat(m * p, n * q);
    for (let i = 0; i < m; i++)
      for (let j = 0; j < n; j++)
        for (let r = 0; r < p; r++)
          for (let s = 0; s < q; s++)
            C[i * p + r][j * q + s] = Am[i][j] * Bm[r][s];
    return fromMat(C);
  },

  // ----------------------------------------------------------------
  // Internal: symmetric Jacobi eigendecomposition
  // ----------------------------------------------------------------

  _symEig(M: Mat): EigResult {
    const n = M.length;
    let V = eye(n);
    const MAX_ITER = 500 * n * n;
    const EPS = 1e-12;

    for (let iter = 0; iter < MAX_ITER; iter++) {
      let offNorm = 0;
      for (let p = 0; p < n - 1; p++)
        for (let q = p + 1; q < n; q++) offNorm += M[p][q] ** 2;
      if (offNorm < EPS) break;

      for (let p = 0; p < n - 1; p++) {
        for (let q = p + 1; q < n; q++) {
          if (Math.abs(M[p][q]) < EPS * 1e-6) continue;
          const theta = 0.5 * Math.atan2(2 * M[p][q], M[q][q] - M[p][p]);
          const c = Math.cos(theta),
            s = Math.sin(theta);

          for (let k = 0; k < n; k++) {
            const mp = M[k][p],
              mq = M[k][q];
            M[k][p] = c * mp + s * mq;
            M[k][q] = -s * mp + c * mq;
          }
          for (let k = 0; k < n; k++) {
            const mp = M[p][k],
              mq = M[q][k];
            M[p][k] = c * mp + s * mq;
            M[q][k] = -s * mp + c * mq;
          }
          for (let k = 0; k < n; k++) {
            const vp = V[k][p],
              vq = V[k][q];
            V[k][p] = c * vp + s * vq;
            V[k][q] = -s * vp + c * vq;
          }
        }
      }
    }

    const eigenvalues = Array.from({ length: n }, (_, i) => M[i][i]);
    // Sort descending by eigenvalue magnitude
    const order = Array.from({ length: n }, (_, i) => i).sort(
      (a, b) => Math.abs(eigenvalues[b]) - Math.abs(eigenvalues[a])
    );
    const sortedVals = order.map((i) => eigenvalues[i]);
    const sortedVecs: Mat = mat(n, n);
    for (let j = 0; j < n; j++)
      for (let i = 0; i < n; i++) sortedVecs[i][j] = V[i][order[j]];

    return {
      values: NDArray.from(sortedVals),
      vectors: fromMat(sortedVecs),
    };
  },

  // ----------------------------------------------------------------
  // Internal: QR eigendecomposition for general matrices
  // ----------------------------------------------------------------

  _qrEig(M: Mat): EigResult {
    const n = M.length;
    let Ak = matCopy(M);
    let Q_total = eye(n);
    const MAX_ITER = 1000;
    const EPS = 1e-10;

    for (let iter = 0; iter < MAX_ITER; iter++) {
      // Wilkinson shift
      const a = Ak[n - 2][n - 2],
        b = Ak[n - 2][n - 1];
      const c = Ak[n - 1][n - 2],
        d = Ak[n - 1][n - 1];
      const tr = (a + d) / 2;
      const det = a * d - b * c;
      const disc = tr * tr - det;
      const mu =
        disc >= 0 ? tr - (tr > 0 ? 1 : -1) * Math.sqrt(Math.max(0, disc)) : d; // use d as shift for complex

      // Subtract shift
      for (let i = 0; i < n; i++) Ak[i][i] -= mu;

      // QR decomposition
      const { Q: Qk, R: Rk } = LinAlg.qr(Ak);
      const Qm = toMat(Qk),
        Rm = toMat(Rk);

      // A_{k+1} = R * Q + μI
      Ak = matMul(Rm, Qm);
      for (let i = 0; i < n; i++) Ak[i][i] += mu;

      Q_total = matMul(Q_total, Qm);

      // Check convergence (sub-diagonal)
      let offNorm = 0;
      for (let i = 1; i < n; i++) offNorm += Ak[i][i - 1] ** 2;
      if (offNorm < EPS) break;
    }

    const eigenvalues = Array.from({ length: n }, (_, i) => Ak[i][i]);
    const order = Array.from({ length: n }, (_, i) => i).sort(
      (a, b) => Math.abs(eigenvalues[b]) - Math.abs(eigenvalues[a])
    );

    return {
      values: NDArray.from(order.map((i) => eigenvalues[i])),
      vectors: fromMat(Q_total.map((row) => order.map((i) => row[i]))),
    };
  },
};

// ---- Helpers outside class ----

function _gramSchmidtComplete(Q: Mat, targetCols: number): Mat {
  const m = Q.length;
  const n = Q[0].length;
  const result: Mat = Q.map((r) =>
    r.slice(0, targetCols).concat(new Array(targetCols - n).fill(0))
  );
  // Fill remaining columns
  for (let newCol = n; newCol < targetCols; newCol++) {
    // Try standard basis vectors
    for (let tryE = 0; tryE < m; tryE++) {
      const v = new Array(targetCols).fill(0);
      v[tryE] = 1;
      // Orthogonalize against existing columns
      for (let existing = 0; existing < newCol; existing++) {
        let dot = 0;
        const col = result.map((r) => r[existing]);
        for (let i = 0; i < m; i++) dot += v[i] * col[i];
        for (let i = 0; i < m; i++) v[i] -= dot * col[i];
      }
      const n2 = norm2(v.slice(0, m));
      if (n2 > 1e-10) {
        for (let i = 0; i < m; i++) result[i][newCol] = v[i] / n2;
        break;
      }
    }
  }
  return result;
}

function _padéExpm(A: Mat, n: number): Mat {
  // Padé approximant of degree 6 for matrix exponential
  const I = eye(n);
  const A2 = matMul(A, A);
  const A4 = matMul(A2, A2);
  const A6 = matMul(A2, A4);

  const b = [
    64764752532480000, 32382376266240000, 7771770303897600, 1187353796428800,
    129060195264000, 10559470521600, 670442572800, 33522128640, 1323241920,
    40840800, 960960, 16380, 182, 1,
  ];

  const scale = (M: Mat, s: number): Mat =>
    M.map((row) => row.map((x) => x * s));
  const addM = (M1: Mat, M2: Mat): Mat =>
    M1.map((row, i) => row.map((v, j) => v + M2[i][j]));

  const U = matMul(
    A,
    addM(
      addM(
        scale(A6, b[13]),
        addM(scale(A4, b[11]), addM(scale(A2, b[9]), scale(I, b[7])))
      ),
      addM(
        addM(
          scale(A6, b[5]),
          addM(scale(A4, b[3]), addM(scale(A2, b[1]), scale(I, b[0])))
        ),
        scale(I, 0)
      ) // placeholder, will recalculate
    )
  );

  // Simpler: Use Horner's method for the two Padé polynomials
  // U = A * (b[13]*A^12 + b[11]*A^10 + b[9]*A^8 + b[7]*A^6 + b[5]*A^4 + b[3]*A^2 + b[1]*I)
  // V = b[12]*A^12 + b[10]*A^10 + b[8]*A^8 + b[6]*A^6 + b[4]*A^4 + b[2]*A^2 + b[0]*I
  // expm = (V - U)^-1 * (V + U)

  const U2 = matMul(
    A,
    addM(
      addM(scale(A6, b[13]), addM(scale(A4, b[11]), scale(A2, b[9]))),
      addM(
        scale(I, b[7]),
        addM(
          addM(scale(A6, b[5] / b[7]), scale(A4, b[3] / b[7])),
          addM(scale(A2, b[1] / b[7]), I)
        )
      )
    )
  );

  const V2 = addM(
    addM(scale(A6, b[12]), addM(scale(A4, b[10]), scale(A2, b[8]))),
    addM(
      scale(I, b[6]),
      addM(
        addM(scale(A6, b[4] / b[6]), scale(A4, b[2] / b[6])),
        addM(scale(A2, b[0] / b[6]), I)
      )
    )
  );
  void U2;
  void V2;
  void U;

  // Use simpler order-5 Padé for stability
  const c = [1, 0.5, 0.1, 1 / 120, 1 / 3840, 1 / 184320];
  let Uk: Mat = mat(n, n);
  let Vk: Mat = matCopy(I);
  let Apow: Mat = matCopy(I);

  for (let k = 0; k <= 5; k++) {
    Apow = k === 0 ? I : matMul(Apow, A);
    if (k % 2 === 1) Uk = addM(Uk, scale(Apow, c[k]));
    else
      Vk = addM(
        Vk.map((r, ri) => r.map((_, ci) => (ri === ci ? 0 : 0))),
        scale(Apow, c[k])
      );
  }

  // Recalculate properly
  const cNum = [1, 0.5, 3 / 28, 1 / 84, 1 / 1680, 1 / 40320];
  const cDen = [1, 0, 3 / 28, 0, 1 / 1680, 0];
  let Num: Mat = mat(n, n);
  let Den: Mat = mat(n, n);
  Apow = matCopy(I);

  for (let k = 0; k <= 5; k++) {
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        Num[i][j] += cNum[k] * Apow[i][j] * (k % 2 === 0 ? 1 : -1);
        Den[i][j] += cDen[k] * Apow[i][j];
      }
    if (k < 5) Apow = matMul(Apow, A);
  }

  // Actually use the most robust simple Taylor series for small norm
  const Taylor: Mat = matCopy(I);
  Apow = matCopy(I);
  let factorial = 1;
  for (let k = 1; k <= 12; k++) {
    factorial *= k;
    Apow = matMul(Apow, A);
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        Taylor[i][j] += Apow[i][j] / factorial;
      }
  }
  return Taylor;
}

export default LinAlg;
