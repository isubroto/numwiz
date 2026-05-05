import numwiz, {
  Arithmetic,
  BigPrecision,
  Calculus,
  FFT,
  Interpolation,
  LinAlg,
  Matrix,
  NDArray,
  Polynomial,
  Random,
  Signal,
  Statistics,
} from "../index";

function close(actual: number, expected: number, precision = 8): void {
  expect(actual).toBeCloseTo(expected, precision);
}

function arrayClose(actual: number[], expected: number[], precision = 8): void {
  expect(actual).toHaveLength(expected.length);
  actual.forEach((value, index) => close(value, expected[index], precision));
}

describe("accuracy validation across scientific modules", () => {
  test("Matrix solves a well-conditioned system and reconstructs identity", () => {
    const A = [
      [4, 7],
      [2, 6],
    ];
    const invA = Matrix.inverse(A);
    const product = Matrix.multiply(A, invA);

    close(Matrix.determinant(A), 10);
    close(product[0][0], 1);
    close(product[0][1], 0);
    close(product[1][0], 0);
    close(product[1][1], 1);
    const solution = Matrix.solve(A, [1, 0]);
    close(solution[0][0], 0.6);
    close(solution[1][0], -0.2);
  });

  test("NDArray dot, reductions, and scalar in-place operations are accurate", () => {
    const a = NDArray.arange(1, 5).reshape([2, 2]);
    const doubled = a.copy().multiplyInPlace(2);

    expect(doubled.toList()).toEqual([
      [2, 4],
      [6, 8],
    ]);
    expect(a.dot(NDArray.identity(2)).toList()).toEqual([
      [1, 2],
      [3, 4],
    ]);
    close(a.mean() as number, 2.5);
    close(a.variance() as number, 1.25);
  });

  test("LinAlg solve, inverse, eigenvalues, and Cholesky match known answers", () => {
    const solution = LinAlg.solve(
      [
        [3, 1],
        [1, 2],
      ],
      [9, 8]
    );
    arrayClose(Array.from(solution.toArray()), [2, 3]);

    const inv = LinAlg.inv([
      [2, 0],
      [0, 4],
    ]).toList() as number[][];
    close(inv[0][0], 0.5);
    close(inv[1][1], 0.25);

    const { values } = LinAlg.eig([
      [2, 1],
      [1, 2],
    ]);
    arrayClose(Array.from(values.toArray()).sort((a, b) => a - b), [1, 3]);

    const { L } = LinAlg.cholesky([
      [4, 2],
      [2, 3],
    ]);
    const lower = L.toList() as number[][];
    close(lower[0][0] ** 2, 4);
    close(lower[1][0] * lower[0][0], 2);
  });

  test("FFT round-trips real signals and identifies a pure tone bin", () => {
    const signal = [1, 0, -1, 0];
    const roundTrip = FFT.ifft(FFT.fft(signal)).map((value) => value.real);
    arrayClose(roundTrip, signal);

    const cosine = Array.from({ length: 16 }, (_, n) =>
      Math.cos((2 * Math.PI * n) / 16)
    );
    const spectrum = FFT.rfft(cosine);
    const magnitudes = FFT.magnitude(spectrum);
    const peakIndex = magnitudes.indexOf(Math.max(...magnitudes.slice(1)));
    expect(peakIndex).toBe(1);
  });

  test("Calculus integration, differentiation, and roots meet analytic values", () => {
    close(Calculus.integrate((x) => x * x, 0, 3), 9, 6);
    close(Calculus.differentiate((x) => x ** 3, 2), 12, 4);
    close(Calculus.bisect((x) => x * x - 2, 1, 2), Math.SQRT2, 8);
  });

  test("Interpolation methods reproduce known samples", () => {
    close(Interpolation.linear(1.5, [0, 1, 2], [0, 2, 4]) as number, 3);
    close(Interpolation.polynomial(1.5, [0, 1, 2], [0, 1, 4]) as number, 2.25);

    const spline = Interpolation.cubicSpline([0, 1, 2], [0, 1, 2]);
    close(spline.evaluate(0.5) as number, 0.5);
  });

  test("Signal utilities preserve convolution, energy, and normalization identities", () => {
    expect(Signal.convolve([1, 2, 3], [1, 1])).toEqual([1, 3, 5, 3]);
    close(Signal.energy([3, 4]), 25);
    expect(Signal.normalize([0, 2, 4])).toEqual([0, 0.5, 1]);
  });

  test("Polynomial operations match roots, calculus, and fitting identities", () => {
    const polynomial = new Polynomial([1, -3, 2]);
    arrayClose(polynomial.roots(), [1, 2]);
    close(polynomial.derivative().evaluate(2), 1);
    close(polynomial.definiteIntegral(0, 1), 5 / 6);

    const fitted = Polynomial.fit([0, 1, 2], [1, 3, 5], 1);
    close(fitted.evaluate(10), 21);
  });

  test("Statistics and BigPrecision validate decimal-sensitive calculations", () => {
    close(Statistics.mean([2, 4, 4, 4, 5, 5, 7, 9]), 5);
    close(Statistics.sampleVariance([2, 4, 4, 4, 5, 5, 7, 9]), 32 / 7);
    close(Statistics.correlation([1, 2, 3], [2, 4, 6]), 1);

    const total = new BigPrecision("0");
    const exact = total.add("0.1").add("0.2").add("0.3");
    expect(exact.toString()).toBe("0.6");
  });

  test("chain API and static arithmetic stay behaviorally aligned", () => {
    expect(numwiz(10).add(5).multiply(2).divide(3).val()).toBe(
      Arithmetic.divide(Arithmetic.multiply(Arithmetic.add(10, 5), 2), 3)
    );
  });

  test("seeded random produces repeatable sequences without mutating static API", () => {
    const a = Random.seed("numwiz");
    const b = Random.seed("numwiz");
    expect(a.generateList(5, 1, 10)).toEqual(b.generateList(5, 1, 10));
  });
});
