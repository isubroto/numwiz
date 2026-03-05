// =====================================================================
// Signal — Signal processing utilities for NumWiz
// Convolution, correlation, windowing, filtering
// =====================================================================

const Signal = {
  // ----------------------------------------------------------------
  // Convolution
  // ----------------------------------------------------------------

  /**
   * Discrete 1-D convolution of a with b.
   * @param mode 'full' (default) | 'same' | 'valid'
   *   - full:  length = len(a) + len(b) - 1
   *   - same:  length = max(len(a), len(b))
   *   - valid: length = max(len(a), len(b)) - min(len(a), len(b)) + 1
   */
  convolve(
    a: number[],
    b: number[],
    mode: "full" | "same" | "valid" = "full"
  ): number[] {
    const la = a.length,
      lb = b.length;
    const fullLen = la + lb - 1;
    const result = new Array<number>(fullLen).fill(0);

    for (let i = 0; i < la; i++)
      for (let j = 0; j < lb; j++) result[i + j] += a[i] * b[j];

    if (mode === "full") return result;

    const maxLen = Math.max(la, lb);
    const minLen = Math.min(la, lb);

    if (mode === "same") {
      const offset = Math.floor((fullLen - maxLen) / 2);
      return result.slice(offset, offset + maxLen);
    }
    if (mode === "valid") {
      const validLen = maxLen - minLen + 1;
      const offset = minLen - 1;
      return result.slice(offset, offset + validLen);
    }
    return result;
  },

  // ----------------------------------------------------------------
  // Cross-correlation
  // ----------------------------------------------------------------

  /**
   * Cross-correlation of a and b.
   * Defined as: c[k] = Σ a[n+k] * b[n]
   * @param mode 'full' | 'same' | 'valid'
   */
  correlate(
    a: number[],
    b: number[],
    mode: "full" | "same" | "valid" = "full"
  ): number[] {
    return Signal.convolve(a, b.slice().reverse(), mode);
  },

  /**
   * Auto-correlation of a signal.
   * Returns the full auto-correlation (length = 2*n - 1).
   */
  autocorrelate(a: number[]): number[] {
    return Signal.correlate(a, a, "full");
  },

  // ----------------------------------------------------------------
  // Moving statistics
  // ----------------------------------------------------------------

  /**
   * Simple moving average with a window of size k.
   * Output length = n - k + 1 (valid mode).
   */
  movingAverage(arr: number[], k: number): number[] {
    if (k <= 0 || k > arr.length) throw new RangeError("Invalid window size");
    const result: number[] = [];
    let windowSum = arr.slice(0, k).reduce((s, x) => s + x, 0);
    result.push(windowSum / k);
    for (let i = k; i < arr.length; i++) {
      windowSum += arr[i] - arr[i - k];
      result.push(windowSum / k);
    }
    return result;
  },

  /**
   * Rolling standard deviation.
   */
  movingStd(arr: number[], k: number, ddof = 0): number[] {
    if (k <= 0 || k > arr.length) throw new RangeError("Invalid window size");
    const result: number[] = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const window = arr.slice(i, i + k);
      const mean = window.reduce((s, x) => s + x, 0) / k;
      const variance =
        window.reduce((s, x) => s + (x - mean) ** 2, 0) / (k - ddof);
      result.push(Math.sqrt(variance));
    }
    return result;
  },

  /**
   * Rolling variance.
   */
  movingVar(arr: number[], k: number, ddof = 0): number[] {
    if (k <= 0 || k > arr.length) throw new RangeError("Invalid window size");
    const result: number[] = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const window = arr.slice(i, i + k);
      const mean = window.reduce((s, x) => s + x, 0) / k;
      result.push(window.reduce((s, x) => s + (x - mean) ** 2, 0) / (k - ddof));
    }
    return result;
  },

  /**
   * Rolling median.
   */
  movingMedian(arr: number[], k: number): number[] {
    if (k <= 0 || k > arr.length) throw new RangeError("Invalid window size");
    const result: number[] = [];
    for (let i = 0; i <= arr.length - k; i++) {
      const window = arr.slice(i, i + k).sort((a, b) => a - b);
      const mid = k >> 1;
      result.push(
        k % 2 === 0 ? (window[mid - 1] + window[mid]) / 2 : window[mid]
      );
    }
    return result;
  },

  // ----------------------------------------------------------------
  // Window functions
  // ----------------------------------------------------------------

  /**
   * Rectangular (boxcar) window.
   */
  windowRectangular(n: number): number[] {
    return new Array(n).fill(1);
  },

  /**
   * Hann (Hanning) window: w[k] = 0.5 * (1 - cos(2πk / (n-1)))
   */
  windowHann(n: number): number[] {
    return Array.from(
      { length: n },
      (_, k) => 0.5 * (1 - Math.cos((2 * Math.PI * k) / (n - 1)))
    );
  },

  /**
   * Hamming window: w[k] = 0.54 - 0.46 * cos(2πk / (n-1))
   */
  windowHamming(n: number): number[] {
    return Array.from(
      { length: n },
      (_, k) => 0.54 - 0.46 * Math.cos((2 * Math.PI * k) / (n - 1))
    );
  },

  /**
   * Blackman window.
   */
  windowBlackman(n: number): number[] {
    return Array.from({ length: n }, (_, k) => {
      const t = (2 * Math.PI * k) / (n - 1);
      return 0.42 - 0.5 * Math.cos(t) + 0.08 * Math.cos(2 * t);
    });
  },

  /**
   * Bartlett (triangular) window.
   */
  windowBartlett(n: number): number[] {
    return Array.from(
      { length: n },
      (_, k) => 1 - Math.abs((2 * k) / (n - 1) - 1)
    );
  },

  /**
   * Flat-top window (for amplitude-accurate measurements).
   */
  windowFlattop(n: number): number[] {
    const a = [0.21557895, 0.41663158, 0.277263158, 0.083578947, 0.006947368];
    return Array.from({ length: n }, (_, k) => {
      const t = (2 * Math.PI * k) / (n - 1);
      return (
        a[0] -
        a[1] * Math.cos(t) +
        a[2] * Math.cos(2 * t) -
        a[3] * Math.cos(3 * t) +
        a[4] * Math.cos(4 * t)
      );
    });
  },

  /**
   * Kaiser window.
   * @param beta Shape parameter (0 = rectangular, 5 ≈ Hamming, 8.6 ≈ Blackman)
   */
  windowKaiser(n: number, beta = 5): number[] {
    const i0Beta = _besselI0(beta);
    return Array.from({ length: n }, (_, k) => {
      const t = (2 * k) / (n - 1) - 1;
      return _besselI0(beta * Math.sqrt(1 - t * t)) / i0Beta;
    });
  },

  /**
   * Gaussian window.
   * @param sigma Standard deviation in samples (default: n/6)
   */
  windowGaussian(n: number, sigma?: number): number[] {
    const s = sigma ?? n / 6;
    const center = (n - 1) / 2;
    return Array.from({ length: n }, (_, k) =>
      Math.exp(-0.5 * ((k - center) / s) ** 2)
    );
  },

  /**
   * Apply a window function to a signal (element-wise multiplication).
   */
  applyWindow(signal: number[], windowFn: (n: number) => number[]): number[] {
    const w = windowFn(signal.length);
    return signal.map((s, i) => s * w[i]);
  },

  // ----------------------------------------------------------------
  // Basic FIR filters
  // ----------------------------------------------------------------

  /**
   * Design a low-pass FIR filter using the windowed-sinc method.
   * @param cutoff Normalized cutoff frequency (0 < cutoff < 1), where 1 = Nyquist
   * @param numTaps Number of filter taps (should be odd for symmetric filter)
   * @param window  Window function to apply (default: Hamming)
   */
  firLowpass(
    cutoff: number,
    numTaps: number,
    windowFn?: (n: number) => number[]
  ): number[] {
    if (numTaps % 2 === 0) numTaps++;
    const win = windowFn ? windowFn(numTaps) : Signal.windowHamming(numTaps);
    const center = (numTaps - 1) / 2;
    return Array.from({ length: numTaps }, (_, k) => {
      const n = k - center;
      const sinc =
        n === 0
          ? 2 * cutoff
          : Math.sin(2 * Math.PI * cutoff * n) / (Math.PI * n);
      return sinc * win[k];
    });
  },

  /**
   * Design a high-pass FIR filter (spectral inversion of low-pass).
   */
  firHighpass(
    cutoff: number,
    numTaps: number,
    windowFn?: (n: number) => number[]
  ): number[] {
    const lp = Signal.firLowpass(cutoff, numTaps, windowFn);
    const center = (lp.length - 1) / 2;
    return lp.map((v, k) => (k === center ? 1 - v : -v));
  },

  /**
   * Apply a FIR filter to a signal (direct-form convolution).
   */
  firFilter(signal: number[], h: number[]): number[] {
    return Signal.convolve(signal, h, "same");
  },

  // ----------------------------------------------------------------
  // Resampling
  // ----------------------------------------------------------------

  /**
   * Simple resample by linear interpolation.
   * @param newLen Target number of samples
   */
  resample(signal: number[], newLen: number): number[] {
    const n = signal.length;
    if (newLen <= 0) return [];
    if (newLen === n) return signal.slice();
    return Array.from({ length: newLen }, (_, i) => {
      const pos = (i / (newLen - 1)) * (n - 1);
      const lo = Math.floor(pos),
        hi = Math.min(lo + 1, n - 1);
      const t = pos - lo;
      return signal[lo] + t * (signal[hi] - signal[lo]);
    });
  },

  // ----------------------------------------------------------------
  // Utility
  // ----------------------------------------------------------------

  /**
   * Zero-pad or truncate a signal to length n.
   */
  zeroPad(signal: number[], n: number): number[] {
    if (signal.length >= n) return signal.slice(0, n);
    return [...signal, ...new Array(n - signal.length).fill(0)];
  },

  /**
   * Normalize signal to peak amplitude of 1.
   */
  normalize(signal: number[]): number[] {
    const peak = Math.max(...signal.map(Math.abs));
    if (peak === 0) return signal.slice();
    return signal.map((x) => x / peak);
  },

  /**
   * Root-mean-square energy of a signal.
   */
  rms(signal: number[]): number {
    return Math.sqrt(signal.reduce((s, x) => s + x * x, 0) / signal.length);
  },

  /**
   * Signal energy: Σ x[n]²
   */
  energy(signal: number[]): number {
    return signal.reduce((s, x) => s + x * x, 0);
  },

  /**
   * Signal power: average energy = E / N
   */
  power(signal: number[]): number {
    return Signal.energy(signal) / signal.length;
  },

  /**
   * Signal-to-Noise Ratio (dB): 10 * log10(power_signal / power_noise)
   */
  snr(signal: number[], noise: number[]): number {
    const ps = Signal.power(signal);
    const pn = Signal.power(noise);
    if (pn === 0) return Infinity;
    return 10 * Math.log10(ps / pn);
  },

  /**
   * Compute the zero-crossing rate.
   */
  zeroCrossingRate(signal: number[]): number {
    let count = 0;
    for (let i = 1; i < signal.length; i++) {
      if (signal[i] >= 0 !== signal[i - 1] >= 0) count++;
    }
    return count / (signal.length - 1);
  },
};

// ---- Modified Bessel function of the first kind I₀(x) ----
// Used for Kaiser window
function _besselI0(x: number): number {
  if (x === 0) return 1;
  // Horner polynomial approximation (highly accurate for |x| <= 3.75 and beyond)
  const ax = Math.abs(x);
  if (ax < 3.75) {
    const t = (x / 3.75) ** 2;
    return (
      1 +
      t *
        (3.5156229 +
          t *
            (3.0899424 +
              t *
                (1.2067492 +
                  t * (0.2659732 + t * (0.0360768 + t * 0.0045813)))))
    );
  }
  const t = 3.75 / ax;
  return (
    (Math.exp(ax) / Math.sqrt(ax)) *
    (0.39894228 +
      t *
        (0.01328592 +
          t *
            (0.00225319 +
              t *
                (-0.00157565 +
                  t *
                    (0.00916281 +
                      t *
                        (-0.02057706 +
                          t *
                            (0.02635537 +
                              t * (-0.01647633 + t * 0.00392377))))))))
  );
}

export default Signal;
