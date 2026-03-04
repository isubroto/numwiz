# NumWiz — Matrix Module

A fully-featured, immutable matrix library for JavaScript providing both a **static functional API** (plain arrays in, plain arrays out) and a **chainable instance API** (fluent builder pattern).

---

## Table of Contents

1. [Import](#import)
2. [Architecture](#architecture)
3. [Error Types](#error-types)
4. [Static API](#static-api)
   - [Creation](#creation)
   - [Inspection](#inspection)
   - [Arithmetic](#arithmetic)
   - [Transformations](#transformations)
   - [Scalar Properties & Reduction](#scalar-properties--reduction)
   - [Row & Column Operations](#row--column-operations)
   - [Decomposition](#decomposition)
   - [Solving Ax = b](#solving-ax--b)
   - [Structure — Slice, Concat, Reshape](#structure--slice-concat-reshape)
   - [Boolean Checks](#boolean-checks)
   - [Vector Operations](#vector-operations)
   - [Aggregation by Row / Column](#aggregation-by-row--column)
   - [Functional / Element-wise](#functional--element-wise)
   - [Display & Utility](#display--utility)
5. [Instance (Chainable) API](#instance-chainable-api)
6. [Quick Reference Table](#quick-reference-table)

---

## Import

```js
const Matrix = require('./src/matrix');
```

---

## Architecture

The module exposes two parallel APIs on the same class:

| API | Input | Output | Use case |
|-----|-------|--------|----------|
| **Static** | `number[][]` plain arrays | `number[][]` plain arrays | One-off computations, interop with other code |
| **Instance** | `new Matrix(data)` | `Matrix` instance | Fluent chains — call `.toArray()` at the end to get data |

```js
// Static — pass arrays, get arrays
const inv = Matrix.inverse([[4,7],[2,6]]);

// Instance — chain operations
const result = new Matrix([[4,7],[2,6]])
  .inverse()
  .multiply([[1,0],[0,1]])
  .round(4)
  .toArray();
```

> **Note:** All static methods are **pure** (non-mutating). Input arrays are deep-copied before processing.

---

## Error Types

| Condition | Error Class |
|-----------|------------|
| Non-array / invalid element / NaN / jagged rows | `TypeError` |
| Wrong dimensions for operation (non-square, size mismatch, out of range index, bad reshape) | `RangeError` |
| Singular matrix (inverse / solve) | `Error` |
| Division by zero (scalar / element divide) | `Error` |
| Linearly dependent columns (QR) | `Error` |

---

## Static API

### Creation

All creation methods return `number[][]`.

---

#### `Matrix.create(rows, cols, fillValue = 0)`

Creates a matrix filled with a constant value.

| Parameter | Type | Description |
|-----------|------|-------------|
| `rows` | `number` | Number of rows (positive integer) |
| `cols` | `number` | Number of columns (positive integer) |
| `fillValue` | `number` | Value to fill with (default `0`) |

**Returns:** `number[][]`  
**Throws:** `RangeError` if dimensions are invalid.

```js
Matrix.create(2, 3);        // [[0,0,0],[0,0,0]]
Matrix.create(2, 2, 5);     // [[5,5],[5,5]]
```

---

#### `Matrix.identity(n)`

Creates an n×n identity matrix.

```js
Matrix.identity(3);
// [[1,0,0],[0,1,0],[0,0,1]]
```

---

#### `Matrix.zeros(rows, cols)` / `Matrix.ones(rows, cols)` / `Matrix.fill(rows, cols, value)`

Convenience aliases for `create`.

```js
Matrix.zeros(2, 3);       // [[0,0,0],[0,0,0]]
Matrix.ones(2, 2);        // [[1,1],[1,1]]
Matrix.fill(2, 2, 7);     // [[7,7],[7,7]]
```

---

#### `Matrix.diagonal(values)`

Creates a square diagonal matrix from an array of values.

| Parameter | Type | Description |
|-----------|------|-------------|
| `values` | `number[]` | Values placed on the main diagonal |

```js
Matrix.diagonal([1, 2, 3]);
// [[1,0,0],[0,2,0],[0,0,3]]
```

---

#### `Matrix.random(rows, cols, min = 0, max = 1, integers = false)`

Creates a matrix of random values in `[min, max)`.

```js
Matrix.random(2, 3);                    // floats in [0, 1)
Matrix.random(2, 3, 1, 10, true);       // integers in [1, 10)
```

---

#### `Matrix.fromFlat(flat, rows, cols)`

Reshapes a 1D flat array into a 2D matrix (row-major order).

| Parameter | Type | Description |
|-----------|------|-------------|
| `flat` | `number[]` | 1D source array |
| `rows` | `number` | Target row count |
| `cols` | `number` | Target column count |

**Throws:** `RangeError` if `flat.length !== rows * cols`.

```js
Matrix.fromFlat([1,2,3,4,5,6], 2, 3);
// [[1,2,3],[4,5,6]]
```

---

#### `Matrix.fromArray(input, rows?, cols?)`

Accepts two call signatures:

- `fromArray(array2D)` — validates and deep-copies a 2D array
- `fromArray(flat, rows, cols)` — reshapes a flat array (equivalent to `fromFlat`)

```js
Matrix.fromArray([[1,2],[3,4]]);          // validates & copies
Matrix.fromArray([1,2,3,4], 2, 2);       // [[1,2],[3,4]]
```

---

#### `Matrix.toArray(m)`

Returns a **2D deep copy** of `m`. Use `Matrix.flatten(m)` for a 1D result.

```js
const copy = Matrix.toArray([[1,2],[3,4]]);
// [[1,2],[3,4]]  — independent copy
```

---

#### `Matrix.columnVector(values)` / `Matrix.rowVector(values)`

```js
Matrix.columnVector([1, 2, 3]);   // [[1],[2],[3]]  (3×1)
Matrix.rowVector([1, 2, 3]);      // [[1,2,3]]      (1×3)
```

---

#### `Matrix.rotation2D(angle)`

2×2 counter-clockwise rotation matrix for `angle` in **radians**.

```js
Matrix.rotation2D(Math.PI / 2);
// [[0,-1],[1,0]]  (approx)
```

---

#### `Matrix.scaling(...factors)`

Diagonal scaling matrix. Equivalent to `Matrix.diagonal(factors)`.

```js
Matrix.scaling(2, 3);    // [[2,0],[0,3]]
```

---

#### `Matrix.hilbert(n)`

The n×n [Hilbert matrix](https://en.wikipedia.org/wiki/Hilbert_matrix) — `H[i][j] = 1 / (i + j + 1)`.

```js
Matrix.hilbert(3);
// [[1, 0.5, 0.333...], [0.5, 0.333..., 0.25], ...]
```

---

#### `Matrix.vandermonde(values, cols)`

Creates a Vandermonde matrix where row `i` is `[v^0, v^1, ..., v^(cols-1)]`.

```js
Matrix.vandermonde([1, 2, 3], 4);
// [[1,1,1,1],[1,2,4,8],[1,3,9,27]]
```

---

#### `Matrix.fromJSON(json)` / `Matrix.toJSON(m)`

JSON serialization round-trip.

```js
const json = Matrix.toJSON([[1,2],[3,4]]);
// { rows: 2, cols: 2, data: [[1,2],[3,4]] }

Matrix.fromJSON(json);
// [[1,2],[3,4]]
```

---

### Inspection

---

#### `Matrix.shape(m)` → `[rows, cols]`

```js
Matrix.shape([[1,2,3],[4,5,6]]);   // [2, 3]
```

---

#### `Matrix.rows(m)` / `Matrix.cols(m)` / `Matrix.size(m)`

```js
Matrix.rows([[1,2],[3,4]]);    // 2
Matrix.cols([[1,2],[3,4]]);    // 2
Matrix.size([[1,2],[3,4]]);    // 4  (total elements)
```

---

#### `Matrix.get(m, row, col)` → `number`

Returns the element at position `[row][col]` (0-based).  
**Throws:** `RangeError` if index is out of range.

```js
Matrix.get([[1,2],[3,4]], 1, 0);   // 3
```

---

#### `Matrix.set(m, row, col, value)` → `number[][]`

Returns a **new** matrix with the element at `[row][col]` replaced. Original is unchanged.

```js
Matrix.set([[1,2],[3,4]], 0, 1, 99);
// [[1,99],[3,4]]
```

---

#### `Matrix.getRow(m, row)` → `number[]`

```js
Matrix.getRow([[1,2,3],[4,5,6]], 1);   // [4, 5, 6]
```

---

#### `Matrix.getCol(m, col)` → `number[]`

```js
Matrix.getCol([[1,2,3],[4,5,6]], 2);   // [3, 6]
```

---

#### `Matrix.getDiagonal(m)` → `number[]`

Returns the main diagonal as a flat array (works for non-square matrices).

```js
Matrix.getDiagonal([[1,2,3],[4,5,6],[7,8,9]]);   // [1, 5, 9]
```

---

#### `Matrix.clone(m)` → `number[][]`

Deep copy. Equivalent to `Matrix.toArray(m)`.

---

#### `Matrix.flatten(m)` → `number[]`

Flattens a 2D matrix to a 1D array in row-major order.

```js
Matrix.flatten([[1,2],[3,4]]);   // [1, 2, 3, 4]
```

---

### Arithmetic

All methods return `number[][]` and never mutate their inputs.

---

#### `Matrix.add(a, b)` / `Matrix.subtract(a, b)`

Element-wise addition / subtraction of two same-size matrices.  
**Throws:** `RangeError` on size mismatch.

```js
Matrix.add([[1,2],[3,4]], [[5,6],[7,8]]);
// [[6,8],[10,12]]
```

---

#### `Matrix.multiply(a, b)`

Standard matrix multiplication.  
**Throws:** `RangeError` if `cols(A) !== rows(B)`.

```js
Matrix.multiply([[1,2],[3,4]], [[5,6],[7,8]]);
// [[19,22],[43,50]]
```

---

#### `Matrix.scale(m, scalar)` / `Matrix.scalarMultiply(m, scalar)`

Multiplies every element by `scalar`. `scalarMultiply` is an alias.

```js
Matrix.scale([[1,2],[3,4]], 3);   // [[3,6],[9,12]]
```

---

#### `Matrix.scalarDivide(m, scalar)`

Divides every element by `scalar`.  
**Throws:** `Error` if `scalar === 0`.

---

#### `Matrix.scalarAdd(m, scalar)` / `Matrix.scalarSubtract(m, scalar)`

Adds / subtracts a constant from every element.

---

#### `Matrix.negate(m)`

Equivalent to `Matrix.scale(m, -1)`.

---

#### `Matrix.hadamard(a, b)`

Element-wise (Hadamard) product of two same-size matrices.

```js
Matrix.hadamard([[1,2],[3,4]], [[2,3],[4,5]]);
// [[2,6],[12,20]]
```

---

#### `Matrix.elementDivide(a, b)`

Element-wise division. **Throws:** `Error` on any zero divisor.

---

#### `Matrix.elementPower(m, exp)`

Raises every element to the power `exp`.

```js
Matrix.elementPower([[1,2],[3,4]], 2);   // [[1,4],[9,16]]
```

---

#### `Matrix.power(m, n)`

Integer matrix exponentiation — repeated matrix multiplication.

| Parameter | Type | Constraint |
|-----------|------|-----------|
| `m` | `number[][]` | Must be square |
| `n` | `number` | Non-negative integer |

**Throws:** `RangeError` if `m` is not square or `n < 0`.

```js
Matrix.power([[1,1],[0,1]], 3);   // [[1,3],[0,1]]
Matrix.power([[2,0],[0,3]], 0);   // identity [[1,0],[0,1]]
```

---

### Transformations

---

#### `Matrix.transpose(m)`

```js
Matrix.transpose([[1,2,3],[4,5,6]]);
// [[1,4],[2,5],[3,6]]
```

---

#### `Matrix.minor(m, row, col)` → `number[][]`

Returns the sub-matrix obtained by removing row `row` and column `col`.

```js
Matrix.minor([[1,2,3],[4,5,6],[7,8,9]], 1, 1);
// [[1,3],[7,9]]
```

---

#### `Matrix.cofactor(m, row, col)` → `number`

Signed minor: `(-1)^(row+col) * det(minor(m, row, col))`.

---

#### `Matrix.cofactorMatrix(m)` → `number[][]`

Matrix of cofactors for every position.

---

#### `Matrix.adjugate(m)` → `number[][]`

Transpose of the cofactor matrix.

---

#### `Matrix.inverse(m)` → `number[][]`

Computes the matrix inverse via Gauss-Jordan elimination with partial pivoting.

**Throws:**
- `RangeError` — if `m` is not square
- `Error` — if `m` is singular (`|det| < 1e-12`)

```js
const inv = Matrix.inverse([[4,7],[2,6]]);
// [[0.6,-0.7],[-0.2,0.4]]

Matrix.inverse([[1,2],[2,4]]);   // throws Error (singular)
```

---

### Scalar Properties & Reduction

---

#### `Matrix.determinant(m)` → `number`

Computes the determinant. Uses direct formulas for 1×1, 2×2, 3×3; LU decomposition for larger matrices.

**Throws:** `RangeError` if not square.

```js
Matrix.determinant([[4,7],[2,6]]);   // 10
Matrix.determinant([[1,2,3],[4,5,6],[7,8,9]]);   // 0  (singular)
```

---

#### `Matrix.trace(m)` → `number`

Sum of the main diagonal.  
**Throws:** `RangeError` if not square.

```js
Matrix.trace([[1,2],[3,4]]);   // 5
```

---

#### `Matrix.sum(m)` → `number`

Sum of all elements.

---

#### `Matrix.min(m)` / `Matrix.max(m)` / `Matrix.mean(m)` → `number`

Global minimum, maximum, and arithmetic mean across all elements.

---

#### `Matrix.normFrobenius(m)` / `Matrix.norm(m)` → `number`

Frobenius norm: $\|A\|_F = \sqrt{\sum_{i,j} a_{ij}^2}$. `norm` is an alias.

```js
Matrix.norm([[3,0],[4,0]]);   // 5
```

---

#### `Matrix.normInf(m)` → `number`

Infinity norm (maximum absolute row sum).

---

#### `Matrix.norm1(m)` → `number`

1-norm (maximum absolute column sum).

---

#### `Matrix.rank(m)` → `number`

Matrix rank computed via RREF.

```js
Matrix.rank([[1,2,3],[4,5,6],[7,8,9]]);   // 2
Matrix.rank([[1,0],[0,1],[0,0]]);          // 2
```

---

#### `Matrix.sumAxis(m, axis)` → `number[]`

Sums along a row or column axis, returning a flat array.

| `axis` | Result |
|--------|--------|
| `'row'` | Sum each row → array of length `rows` |
| `'col'` | Sum each column → array of length `cols` |

```js
Matrix.sumAxis([[1,2,3],[4,5,6]], 'row');   // [6, 15]
Matrix.sumAxis([[1,2],[3,4]], 'col');        // [4, 6]
```

---

### Row & Column Operations

---

#### `Matrix.swapRows(m, r1, r2)` / `Matrix.swapCols(m, c1, c2)`

Returns a new matrix with two rows (or columns) swapped.  
**Throws:** `RangeError` if index is out of range.

```js
Matrix.swapRows([[1,2],[3,4],[5,6]], 0, 2);
// [[5,6],[3,4],[1,2]]
```

---

#### `Matrix.scaleRow(m, row, scalar)`

Multiplies every element of `row` by `scalar`.

---

#### `Matrix.addRowMultiple(m, target, source, scalar)`

Row operation: `row[target] += scalar * row[source]`.

---

#### `Matrix.ref(m)` → `number[][]`

Row Echelon Form.

---

#### `Matrix.rref(m)` → `number[][]`

Reduced Row Echelon Form (full Gauss-Jordan elimination).

```js
Matrix.rref([[2,1,-1,8],[-3,-1,2,-11],[-2,1,2,-3]]);
// [[1,0,0,2],[0,1,0,3],[0,0,1,-1]]
```

---

### Decomposition

---

#### `Matrix.lu(m)` → `{ L, U, P }`

LU decomposition with partial pivoting. Returns three plain `number[][]` arrays satisfying **PA = LU**.

| Property | Type | Description |
|----------|------|-------------|
| `L` | `number[][]` | Lower triangular with 1s on diagonal |
| `U` | `number[][]` | Upper triangular |
| `P` | `number[][]` | Permutation matrix |

**Throws:** `RangeError` if not square.

```js
const { L, U, P } = Matrix.lu([[2,1,1],[4,3,3],[8,7,9]]);
// Verify: Matrix.multiply(P, A) ≈ Matrix.multiply(L, U)
```

---

#### `Matrix.qr(m)` → `{ Q, R }`

QR decomposition via Gram-Schmidt orthogonalization. Returns two plain `number[][]` arrays satisfying **A = QR**.

| Property | Type | Description |
|----------|------|-------------|
| `Q` | `number[][]` | Orthogonal matrix (rows ≥ cols) |
| `R` | `number[][]` | Upper triangular matrix |

**Throws:**
- `RangeError` — if `rows < cols`
- `Error` — if columns are linearly dependent

```js
const { Q, R } = Matrix.qr([[12,-51,4],[6,167,-68],[-4,24,-41]]);
```

---

#### `Matrix.eigenvalues(m)` → `number[]`

Eigenvalues computed via QR iteration (for n ≥ 3) or direct formula (n = 1, 2). Returns real eigenvalues.

**Throws:** `RangeError` if not square.

```js
Matrix.eigenvalues([[4,1],[2,3]]);   // [5, 2]
```

---

#### `Matrix.eigenvalues2x2(m)` → `number[] | {real, imag}[]`

Dedicated 2×2 eigenvalue solver. Returns real numbers for real eigenvalues, or `{ real, imag }` objects for complex ones.

**Throws:** `RangeError` if not 2×2.

```js
Matrix.eigenvalues2x2([[4,1],[2,3]]);
// [5, 2]  — real

Matrix.eigenvalues2x2([[0,-1],[1,0]]);
// [{ real: 0, imag: 1 }, { real: 0, imag: -1 }]  — complex
```

---

### Solving Ax = b

---

#### `Matrix.solve(A, b)` → `number[][]`

Solves the linear system **Ax = b** via Gaussian elimination with partial pivoting.

| Parameter | Type | Description |
|-----------|------|-------------|
| `A` | `number[][]` | n×n coefficient matrix |
| `b` | `number[]` or `number[][]` | Right-hand side — flat array **or** n×1 column vector |

**Returns:** n×1 column vector `[[x₁], [x₂], ..., [xₙ]]`  
**Throws:**
- `RangeError` — if `A` is not square or `b` has wrong length
- `Error` — if `A` is singular

```js
// 2x + y = 5,  x + 3y = 10  →  x=1, y=3
const x = Matrix.solve([[2,1],[1,3]], [5,10]);
x[0][0];   // 1
x[1][0];   // 3

// Also accepts column vector b:
Matrix.solve([[2,1],[1,3]], [[5],[10]]);
```

---

#### `Matrix.solveCramer(A, b)` → `number[][]`

Solves **Ax = b** using [Cramer's rule](https://en.wikipedia.org/wiki/Cramer%27s_rule). Less numerically stable than Gaussian elimination; prefer `solve` for large systems.

| Parameter | Type |
|-----------|------|
| `A` | `number[][]` — n×n |
| `b` | `number[]` — flat array |

**Returns:** n×1 column vector `[[x₁], [x₂], ..., [xₙ]]`  
**Throws:** `Error` if singular.

```js
const x = Matrix.solveCramer([[2,1],[1,3]], [5,10]);
x[0][0];   // 1
x[1][0];   // 3
```

---

### Structure — Slice, Concat, Reshape

---

#### `Matrix.slice(m, startRow, startCol, endRow, endCol)` → `number[][]`

Extracts a sub-matrix. Row and column ranges are **[start, end)** (start inclusive, end exclusive).

| Parameter | Type | Description |
|-----------|------|-------------|
| `startRow` | `number` | First row to include (inclusive) |
| `startCol` | `number` | First column to include (inclusive) |
| `endRow` | `number` | Row boundary (exclusive) |
| `endCol` | `number` | Column boundary (exclusive) |

**Throws:** `RangeError` on invalid range.

```js
const A = [[1,2,3],[4,5,6],[7,8,9]];

Matrix.slice(A, 0, 1, 2, 3);    // rows [0,2), cols [1,3) → [[2,3],[5,6]]
Matrix.slice(A, 0, 0, 2, 2);    // top-left 2×2 → [[1,2],[4,5]]
```

---

#### `Matrix.subMatrix(m, startRow, startCol, endRow, endCol)`

Alias for `Matrix.slice` — identical parameter order and behaviour.

---

#### `Matrix.hStack(a, b)` / `Matrix.hConcat(a, b)`

Horizontally concatenates two matrices (they must have the same number of rows).  
`hConcat` is an alias.

```js
Matrix.hStack([[1,2],[3,4]], [[5],[6]]);
// [[1,2,5],[3,4,6]]
```

---

#### `Matrix.vStack(a, b)` / `Matrix.vConcat(a, b)`

Vertically concatenates two matrices (they must have the same number of columns).  
`vConcat` is an alias.

```js
Matrix.vStack([[1,2],[3,4]], [[5,6]]);
// [[1,2],[3,4],[5,6]]
```

---

#### `Matrix.reshape(m, rows, cols)` → `number[][]`

Re-interprets the elements of `m` (row-major order) into new dimensions.

**Throws:** `RangeError` if total element count changes.

```js
Matrix.reshape([[1,2,3],[4,5,6]], 3, 2);
// [[1,2],[3,4],[5,6]]
```

---

### Boolean Checks

All boolean checks return `boolean` and tolerate floating-point noise at `1e-10` (unless otherwise noted).

---

#### `Matrix.isSquare(m)` → `boolean`

```js
Matrix.isSquare([[1,2],[3,4]]);     // true
Matrix.isSquare([[1,2,3],[4,5,6]]); // false
```

---

#### `Matrix.isIdentity(m)` → `boolean`

---

#### `Matrix.isSymmetric(m)` → `boolean`

True if square and `A[i][j] === A[j][i]` for all `i`, `j`.

---

#### `Matrix.isDiagonal(m)` → `boolean`

True if all off-diagonal elements are zero.

---

#### `Matrix.isUpperTriangular(m)` / `Matrix.isLowerTriangular(m)` → `boolean`

---

#### `Matrix.isOrthogonal(m, tolerance = 1e-8)` → `boolean`

True if `A × Aᵀ ≈ I` within `tolerance`. The wider default (`1e-8`) accommodates floating-point accumulation after operations like QR decomposition.

```js
const { Q } = Matrix.qr([[12,-51,4],[6,167,-68],[-4,24,-41]]);
Matrix.isOrthogonal(Matrix.round(Q, 10));   // true
```

---

#### `Matrix.isSingular(m)` → `boolean`

True if `|det(m)| < 1e-10`.

---

#### `Matrix.isZero(m)` → `boolean`

True if all elements are effectively zero (`< 1e-10`).

---

#### `Matrix.isVector(m)` → `boolean`

True if matrix has exactly one row **or** one column.

---

#### `Matrix.isRowVector(m)` / `Matrix.isColumnVector(m)` → `boolean`

---

#### `Matrix.isSameShape(a, b)` → `boolean`

True if `a` and `b` have identical dimensions.

---

#### `Matrix.equals(a, b, tolerance = 1e-10)` / `Matrix.isEqual(a, b, tolerance = 1e-10)` → `boolean`

Element-wise comparison within tolerance. `isEqual` is an alias for `equals`.

```js
Matrix.isEqual([[1.0001]], [[1]], 0.001);   // true
Matrix.isEqual([[1,2],[3,4]], [[1,2],[3,4]]); // true
```

---

### Vector Operations

These methods accept both flat `number[]` arrays and `number[][]` matrix representations.

---

#### `Matrix.dot(a, b)` → `number`

Dot product of two vectors.  
**Throws:** `RangeError` if lengths differ.

```js
Matrix.dot([1,2,3], [4,5,6]);   // 32
```

---

#### `Matrix.cross(a, b)` → `number[]`

Cross product of two 3D vectors (flat array result).  
**Throws:** `RangeError` if either vector is not length 3.

```js
Matrix.cross([1,0,0], [0,1,0]);   // [0, 0, 1]
```

---

#### `Matrix.magnitude(v)` → `number`

Euclidean magnitude (2-norm) of a vector.

---

#### `Matrix.normalize(v)` → `number[]`

Returns the unit vector of `v`.  
**Throws:** `Error` if `v` is the zero vector.

---

#### `Matrix.angleBetween(a, b)` → `number`

Angle between two vectors in **radians**.

---

### Aggregation by Row / Column

These methods return matrices (not scalars) to preserve structure.

---

#### `Matrix.rowSums(m)` → `number[][]`

n×1 column vector of row sums.

```js
Matrix.rowSums([[1,2,3],[4,5,6]]);   // [[6],[15]]
```

---

#### `Matrix.colSums(m)` → `number[][]`

1×n row vector of column sums.

```js
Matrix.colSums([[1,2],[3,4]]);   // [[4,6]]
```

---

#### `Matrix.rowMeans(m)` → `number[][]`

n×1 column vector of row means.

---

#### `Matrix.colMeans(m)` → `number[][]`

1×n row vector of column means.

---

### Functional / Element-wise

---

#### `Matrix.map(m, fn)` → `number[][]`

Applies `fn(value, rowIndex, colIndex)` to every element.

```js
Matrix.map([[1,2],[3,4]], (v, i, j) => v + i * 10);
// [[1,2],[13,14]]
```

---

#### `Matrix.forEach(m, fn)`

Iterates every element with `fn(value, rowIndex, colIndex)`. Returns `undefined`.

---

#### `Matrix.every(m, fn)` → `boolean`

Returns `true` if `fn` returns truthy for every element.

---

#### `Matrix.some(m, fn)` → `boolean`

Returns `true` if `fn` returns truthy for at least one element.

---

#### `Matrix.round(m, decimals = 0)` → `number[][]`

Rounds every element to `decimals` decimal places.

```js
Matrix.round([[1.556, 2.334]], 2);   // [[1.56, 2.33]]
```

---

#### `Matrix.abs(m)` → `number[][]`

Absolute value of every element.

---

### Display & Utility

---

#### `Matrix.toString(m, decimals = 4)` → `string`

Pretty-prints the matrix with bracket notation. Columns are right-aligned.

```js
console.log(Matrix.toString([[1.5, 2.3],[10, 0.001]]));
// ┌  1.5000   2.3000 ┐
// └ 10.0000   0.0010 ┘
```

---

#### `Matrix.print(m, decimals = 4)`

Calls `console.log(Matrix.toString(m, decimals))`. Returns `undefined`.

---

#### `Matrix.toHTML(m, className = 'matrix')` → `string`

Returns an HTML `<table>` string representation.

---

#### `Matrix.toJSON(m)` → `{ rows, cols, data }`

Serializes to a plain object. Use `Matrix.fromJSON` to deserialize.

---

## Instance (Chainable) API

Create an instance with `new Matrix(data)`. All chainable methods return a new `Matrix` instance.  
Call `.toArray()` at the end to retrieve the underlying `number[][]`.

```js
const m = new Matrix([[1,2],[3,4]]);
```

### Getters (non-chainable)

| Method | Returns | Description |
|--------|---------|-------------|
| `getRows()` | `number` | Row count |
| `getCols()` | `number` | Column count |
| `getShape()` | `number[]` | `[rows, cols]` |
| `getSize()` | `number` | Total elements |
| `getElement(r, c)` | `number` | Element at position |

### Terminal methods (produce a value, not a Matrix)

| Method | Returns | Description |
|--------|---------|-------------|
| `toArray()` | `number[][]` | 2D deep copy of the data |
| `flatten()` | `number[]` | 1D flat array |
| `getDiagonal()` | `number[]` | Main diagonal |
| `determinant()` | `number` | Matrix determinant |
| `trace()` | `number` | Trace |
| `sum()` | `number` | Sum of all elements |
| `min()` | `number` | Minimum element |
| `max()` | `number` | Maximum element |
| `mean()` | `number` | Mean of all elements |
| `rank()` | `number` | Rank |
| `norm()` / `normFrobenius()` | `number` | Frobenius norm |
| `eigenvalues()` | `number[]` | Eigenvalues |
| `isSquare()` | `boolean` | Shape check |
| `isIdentity()` | `boolean` | |
| `isSymmetric()` | `boolean` | |
| `isDiagonal()` | `boolean` | |
| `isUpperTriangular()` | `boolean` | |
| `isLowerTriangular()` | `boolean` | |
| `isOrthogonal(tol?)` | `boolean` | Tolerance defaults to `1e-8` |
| `isSingular()` | `boolean` | |
| `isZero()` | `boolean` | |
| `equals(other, tol?)` / `isEqual(other, tol?)` | `boolean` | |
| `toString(decimals?)` | `string` | Pretty-print |
| `lu()` | `{L,U,P}` | LU decomposition (plain arrays) |
| `qr()` | `{Q,R}` | QR decomposition (plain arrays) |

### Chainable methods (return a new `Matrix`)

| Method | Description |
|--------|-------------|
| `add(other)` | Element-wise addition |
| `subtract(other)` | Element-wise subtraction |
| `multiply(other)` | Matrix multiplication |
| `scale(scalar)` | Scalar multiplication |
| `negate()` | Negate all elements |
| `hadamard(other)` | Element-wise product |
| `elementDivide(other)` | Element-wise division |
| `elementPower(exp)` | Element-wise power |
| `power(n)` | Matrix integer power |
| `scalarAdd(s)` | Add constant to every element |
| `scalarSubtract(s)` | Subtract constant from every element |
| `transpose()` | Transpose |
| `inverse()` | Matrix inverse (throws if singular) |
| `adjugate()` | Adjugate |
| `rref()` | Reduced Row Echelon Form |
| `ref()` | Row Echelon Form |
| `solve(b)` | Solve Ax=b — returns n×1 `Matrix` |
| `hStack(other)` | Horizontal concatenation |
| `vStack(other)` | Vertical concatenation |
| `slice(startRow, startCol, endRow, endCol)` | Sub-matrix extraction |
| `reshape(rows, cols)` | Reshape |
| `swapRows(r1, r2)` | Swap two rows |
| `swapCols(c1, c2)` | Swap two columns |
| `map(fn)` | Element-wise transform |
| `round(decimals?)` | Round elements |
| `abs()` | Absolute value of elements |
| `clone()` | Deep copy as new instance |
| `print(decimals?)` | Print to console (returns `this` for chaining) |

### Chain examples

```js
// Solve and extract first solution component
const x = new Matrix([[2,1],[1,3]])
  .solve([[5],[10]])
  .toArray();
x[0][0];   // 1
x[1][0];   // 3

// Compute inverse and verify A × A⁻¹ = I
const isId = new Matrix([[4,7],[2,6]])
  .inverse()
  .multiply([[4,7],[2,6]])
  .round(10)
  .isIdentity();
// true

// Extract top-left 2×2 from a 3×3
const sub = new Matrix([[1,2,3],[4,5,6],[7,8,9]])
  .slice(0, 0, 2, 2)   // rows [0,2), cols [0,2)
  .toArray();
// [[1,2],[4,5]]

// Transform and display
new Matrix([[1.556, 2.334]])
  .round(2)
  .print();
// [ 1.56  2.33 ]
```

---

## Quick Reference Table

| Group | Key methods |
|-------|-------------|
| **Create** | `create`, `identity`, `zeros`, `ones`, `diagonal`, `random`, `fromFlat`, `fromArray`, `columnVector`, `rowVector`, `rotation2D`, `scaling`, `hilbert`, `vandermonde` |
| **Inspect** | `shape`, `rows`, `cols`, `size`, `get`, `set`, `getRow`, `getCol`, `getDiagonal`, `clone`, `flatten`, `toArray` |
| **Arithmetic** | `add`, `subtract`, `multiply`, `scale`, `negate`, `hadamard`, `elementDivide`, `elementPower`, `power` |
| **Transform** | `transpose`, `inverse`, `adjugate`, `minor`, `cofactor`, `cofactorMatrix` |
| **Reduction** | `determinant`, `trace`, `rank`, `sum`, `min`, `max`, `mean`, `norm`, `normFrobenius`, `normInf`, `norm1`, `sumAxis` |
| **Row/col ops** | `swapRows`, `swapCols`, `scaleRow`, `addRowMultiple`, `ref`, `rref` |
| **Decompose** | `lu`, `qr`, `eigenvalues`, `eigenvalues2x2` |
| **Solve** | `solve`, `solveCramer` |
| **Structure** | `slice`, `subMatrix`, `hStack`, `hConcat`, `vStack`, `vConcat`, `reshape` |
| **Boolean** | `isSquare`, `isIdentity`, `isSymmetric`, `isDiagonal`, `isUpperTriangular`, `isLowerTriangular`, `isOrthogonal`, `isSingular`, `isZero`, `isVector`, `isRowVector`, `isColumnVector`, `isSameShape`, `equals`, `isEqual` |
| **Vector** | `dot`, `cross`, `magnitude`, `normalize`, `angleBetween` |
| **Aggregate** | `rowSums`, `colSums`, `rowMeans`, `colMeans` |
| **Functional** | `map`, `forEach`, `every`, `some`, `round`, `abs` |
| **Display** | `toString`, `print`, `toHTML`, `toJSON`, `fromJSON` |
