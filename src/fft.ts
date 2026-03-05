// =====================================================================
// FFT — Fast Fourier Transform for NumWiz
// Iterative Cooley-Tukey radix-2 DIT with bit-reversal permutation.
// =====================================================================

// ---- Local complex number type (real/imag fields) ----
interface Cx {
  real: number;
  imag: number;
}
/** ComplexNumber type used by FFT functions. */
type ComplexNumber = Cx;
export type { ComplexNumber };

// ---- Complex arithmetic helpers ----

function cx(real: number, imag = 0): Cx {
  return { real, imag };
}
function cxAdd(a: Cx, b: Cx): Cx {
  return { real: a.real + b.real, imag: a.imag + b.imag };
}
function cxSub(a: Cx, b: Cx): Cx {
  return { real: a.real - b.real, imag: a.imag - b.imag };
}
function cxMul(a: Cx, b: Cx): Cx {
  return {
    real: a.real * b.real - a.imag * b.imag,
    imag: a.real * b.imag + a.imag * b.real,
  };
}
function cxAbs(a: Cx): number {
  return Math.sqrt(a.real * a.real + a.imag * a.imag);
}
function cxArg(a: Cx): number {
  return Math.atan2(a.imag, a.real);
}
function cxConj(a: Cx): Cx {
  return { real: a.real, imag: -a.imag };
}

// ---- Bit-reversal permutation ----
function bitReversePermute(arr: ComplexNumber[]): ComplexNumber[] {
  const n = arr.length;
  const result = arr.slice();
  let j = 0;
  for (let i = 1; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// ---- Next power of 2 ----
function nextPow2(n: number): number {
  let p = 1;
  while (p < n) p <<= 1;
  return p;
}

// ---- Pad to power of 2 (zero-padding) ----
function padToPow2(data: ComplexNumber[]): ComplexNumber[] {
  const n = nextPow2(data.length);
  const result = data.slice();
  while (result.length < n) result.push(cx(0));
  return result;
}

// =====================================================================
// FFT module
// =====================================================================

const FFT = {
  // ----------------------------------------------------------------
  // Core DFT (no restrictions on size, O(n log n) for powers of 2)
  // ----------------------------------------------------------------

  /**
   * Compute the Discrete Fourier Transform of a complex signal.
   * Input may be real numbers or ComplexNumber objects.
   * Automatically zero-pads to the next power of 2.
   * @returns Array of ComplexNumber frequency bins
   */
  fft(signal: number[] | ComplexNumber[], n?: number): ComplexNumber[] {
    const raw: ComplexNumber[] = signal.map((s) =>
      typeof s === "number" ? cx(s) : s
    );
    const size = n ?? nextPow2(raw.length);
    const data: ComplexNumber[] = raw.slice(0, size);
    while (data.length < size) data.push(cx(0));

    return FFT._iterativeFFT(data, false);
  },

  /**
   * Inverse FFT. Returns complex time-domain signal.
   * @param normalize If true (default), divides by N
   */
  ifft(spectrum: ComplexNumber[], normalize = true): ComplexNumber[] {
    const n = spectrum.length;
    const result = FFT._iterativeFFT(spectrum, true);
    if (normalize)
      return result.map((c) => ({ real: c.real / n, imag: c.imag / n }));
    return result;
  },

  /**
   * Real FFT: efficient FFT for real-valued input.
   * Returns the first N/2 + 1 complex bins (non-redundant half).
   */
  rfft(signal: number[], n?: number): ComplexNumber[] {
    const size = n ?? nextPow2(signal.length);
    const complex: ComplexNumber[] = signal.slice(0, size).map((v) => cx(v));
    while (complex.length < size) complex.push(cx(0));
    const spectrum = FFT._iterativeFFT(complex, false);
    return spectrum.slice(0, Math.floor(size / 2) + 1);
  },

  /**
   * Inverse real FFT. Reconstructs real-valued signal from rfft output.
   * @param n Length of output signal (default: 2*(spectrum.length-1))
   */
  irfft(spectrum: ComplexNumber[], n?: number): number[] {
    const m = spectrum.length;
    const size = n ?? 2 * (m - 1);
    // Reconstruct full symmetric spectrum
    const full: ComplexNumber[] = spectrum.slice();
    for (let i = m - 2; i >= 1; i--) full.push(cxConj(spectrum[i]));
    while (full.length < size) full.push(cx(0));
    const result = FFT.ifft(full);
    return result.slice(0, size).map((c) => c.real);
  },

  // ----------------------------------------------------------------
  // Frequency bins
  // ----------------------------------------------------------------

  /**
   * Return the DFT sample frequencies.
   * @param n Number of samples
   * @param d Sample spacing (default: 1.0)
   */
  fftfreq(n: number, d = 1): number[] {
    const result: number[] = new Array(n);
    const half = Math.floor((n + 1) / 2);
    for (let i = 0; i < half; i++) result[i] = i / (d * n);
    for (let i = half; i < n; i++) result[i] = (i - n) / (d * n);
    return result;
  },

  /**
   * Return the DFT sample frequencies for real FFT output.
   * Returns n/2 + 1 non-negative frequency bins.
   */
  rfftfreq(n: number, d = 1): number[] {
    const m = Math.floor(n / 2) + 1;
    return Array.from({ length: m }, (_, i) => i / (d * n));
  },

  /**
   * Shift frequency array (or spectrum) so that zero frequency is at the center.
   * Mimics numpy.fft.fftshift.
   */
  fftshift<T>(arr: T[]): T[] {
    const n = arr.length;
    const shift = Math.floor(n / 2);
    return [...arr.slice(shift), ...arr.slice(0, shift)];
  },

  /**
   * Inverse fftshift: undo fftshift.
   */
  ifftshift<T>(arr: T[]): T[] {
    const n = arr.length;
    const shift = Math.ceil(n / 2);
    return [...arr.slice(shift), ...arr.slice(0, shift)];
  },

  // ----------------------------------------------------------------
  // Spectrum analysis
  // ----------------------------------------------------------------

  /**
   * Power Spectral Density: |X[k]|² / N
   */
  powerSpectrum(signal: number[] | ComplexNumber[]): number[] {
    const spectrum = FFT.fft(signal);
    const n = spectrum.length;
    return spectrum.map((c) => (c.real * c.real + c.imag * c.imag) / n);
  },

  /**
   * Magnitude spectrum: |X[k]|
   */
  magnitude(spectrum: ComplexNumber[]): number[] {
    return spectrum.map(cxAbs);
  },

  /**
   * Phase spectrum: angle(X[k]) in radians.
   */
  phase(spectrum: ComplexNumber[]): number[] {
    return spectrum.map(cxArg);
  },

  /**
   * Unwrap phase array (remove discontinuities > π).
   */
  unwrapPhase(phase: number[]): number[] {
    const result = phase.slice();
    for (let i = 1; i < result.length; i++) {
      let delta = result[i] - result[i - 1];
      while (delta > Math.PI) {
        delta -= 2 * Math.PI;
      }
      while (delta < -Math.PI) {
        delta += 2 * Math.PI;
      }
      result[i] = result[i - 1] + delta;
    }
    return result;
  },

  /**
   * Compute the n-point DFT of the cross-correlation of x and y.
   * Returns the frequency-domain cross-power spectrum X[k] * conj(Y[k]).
   */
  crossSpectrum(x: number[], y: number[]): ComplexNumber[] {
    const n = nextPow2(Math.max(x.length, y.length));
    const X = FFT.fft(x, n);
    const Y = FFT.fft(y, n);
    return X.map((xi, i) => cxMul(xi, cxConj(Y[i])));
  },

  // ----------------------------------------------------------------
  // 2-D FFT
  // ----------------------------------------------------------------

  /**
   * 2-D FFT: compute FFT along both axes.
   */
  fft2(matrix: number[][]): ComplexNumber[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const nCols = nextPow2(cols);

    // FFT each row
    const rowFFT: ComplexNumber[][] = matrix.map((row) => FFT.fft(row, nCols));
    const nRows = nextPow2(rows);
    while (rowFFT.length < nRows) rowFFT.push(new Array(nCols).fill(cx(0)));

    // FFT each column
    const result: ComplexNumber[][] = Array.from({ length: nRows }, () =>
      new Array(nCols).fill(cx(0))
    );
    for (let j = 0; j < nCols; j++) {
      const col = rowFFT.map((row) => row[j]);
      const colFFT = FFT.fft(col, nRows);
      for (let i = 0; i < nRows; i++) result[i][j] = colFFT[i];
    }
    return result;
  },

  /**
   * Inverse 2-D FFT.
   */
  ifft2(spectrum: ComplexNumber[][]): ComplexNumber[][] {
    const m = spectrum.length;
    const n = spectrum[0].length;

    // IFFT each row
    const rowIFFT = spectrum.map((row) => FFT.ifft(row, false));
    // IFFT each column, then normalize by m*n
    const result: ComplexNumber[][] = Array.from({ length: m }, () =>
      new Array(n).fill(cx(0))
    );
    for (let j = 0; j < n; j++) {
      const col = rowIFFT.map((row) => row[j]);
      const colIFFT = FFT.ifft(col, false);
      for (let i = 0; i < m; i++) {
        result[i][j] = {
          real: colIFFT[i].real / (m * n),
          imag: colIFFT[i].imag / (m * n),
        };
      }
    }
    return result;
  },

  // ----------------------------------------------------------------
  // Short-Time Fourier Transform (STFT)
  // ----------------------------------------------------------------

  /**
   * STFT: divide signal into overlapping frames and FFT each.
   * @param windowFn Window function (default: rectangular)
   * @returns Array of spectra (one per frame) — [frames × fftSize/2+1]
   */
  stft(
    signal: number[],
    fftSize = 512,
    hopSize = 256,
    windowFn?: (n: number) => number[]
  ): ComplexNumber[][] {
    const n = signal.length;
    const win = windowFn ? windowFn(fftSize) : new Array(fftSize).fill(1);
    const result: ComplexNumber[][] = [];

    for (let start = 0; start <= n - fftSize; start += hopSize) {
      const frame = Array.from(
        { length: fftSize },
        (_, i) => signal[start + i] * win[i]
      );
      result.push(FFT.rfft(frame, fftSize));
    }
    return result;
  },

  // ----------------------------------------------------------------
  // Internal: iterative Cooley-Tukey FFT
  // ----------------------------------------------------------------

  _iterativeFFT(data: ComplexNumber[], inverse: boolean): ComplexNumber[] {
    const n = data.length;
    if ((n & (n - 1)) !== 0)
      throw new Error(`FFT size must be a power of 2, got ${n}`);
    if (n === 1) return data.slice();
    if (n === 0) return [];

    const result = bitReversePermute(data);
    const sign = inverse ? 1 : -1;

    for (let len = 2; len <= n; len <<= 1) {
      const halfLen = len >> 1;
      const ang = (sign * 2 * Math.PI) / len;
      const wLen = cx(Math.cos(ang), Math.sin(ang));

      for (let i = 0; i < n; i += len) {
        let w = cx(1, 0);
        for (let j = 0; j < halfLen; j++) {
          const u = result[i + j];
          const v = cxMul(result[i + j + halfLen], w);
          result[i + j] = cxAdd(u, v);
          result[i + j + halfLen] = cxSub(u, v);
          w = cxMul(w, wLen);
        }
      }
    }
    return result;
  },
};

export default FFT;
