import Signal from "../src/signal";

const TOL = 1e-9;
function close(a: number, b: number, tol = TOL) {
  expect(Math.abs(a - b)).toBeLessThan(tol);
}
function arrClose(a: number[], b: number[], tol = TOL) {
  expect(a.length).toBe(b.length);
  a.forEach((v, i) => expect(Math.abs(v - b[i])).toBeLessThan(tol));
}

// ═══════════════════════════════════════════════════════════════════
// CONVOLVE
// ═══════════════════════════════════════════════════════════════════
describe("Signal — convolve", () => {
  test("[1,2,3] * [1,1] full = [1,3,5,3]", () => {
    arrClose(Signal.convolve([1, 2, 3], [1, 1], "full"), [1, 3, 5, 3]);
  });

  test("[1,2,3] * [0,1,0.5] full = [0,1,2.5,4,1.5]", () => {
    arrClose(
      Signal.convolve([1, 2, 3], [0, 1, 0.5], "full"),
      [0, 1, 2.5, 4, 1.5]
    );
  });

  test("'same' mode length = max(len_a, len_b)", () => {
    const a = [1, 2, 3, 4, 5];
    const b = [1, 0, -1];
    const s = Signal.convolve(a, b, "same");
    expect(s.length).toBe(Math.max(a.length, b.length));
  });

  test("'valid' mode length = max_len - min_len + 1", () => {
    const a = [1, 2, 3, 4, 5];
    const b = [1, 0, -1];
    const v = Signal.convolve(a, b, "valid");
    expect(v.length).toBe(a.length - b.length + 1);
  });

  test("convolution with [1] is identity (full)", () => {
    const signal = [1, 2, 3, 4, 5];
    arrClose(Signal.convolve(signal, [1], "full"), signal);
  });

  test("convolution with [0,1,0] shifts by delay (full)", () => {
    const signal = [1, 2, 3];
    const result = Signal.convolve(signal, [0, 1, 0], "full");
    // full length = 5, middle should match signal
    close(result[1], 1);
    close(result[2], 2);
    close(result[3], 3);
  });
});

// ═══════════════════════════════════════════════════════════════════
// CORRELATE
// ═══════════════════════════════════════════════════════════════════
describe("Signal — correlate", () => {
  test("self-correlation peak is at center index (full mode)", () => {
    const signal = [1, 2, 3, 2, 1];
    const corr = Signal.correlate(signal, signal, "full");
    const center = Math.floor(corr.length / 2);
    expect(corr[center]).toBe(Math.max(...corr));
  });

  test("correlate([1,0,0,0],[1,0,0,0]) peak at 0 lag", () => {
    const x = [1, 0, 0, 0];
    const corr = Signal.correlate(x, x, "full");
    const center = Math.floor(corr.length / 2);
    close(corr[center], 1);
  });
});

// ═══════════════════════════════════════════════════════════════════
// AUTOCORRELATE
// ═══════════════════════════════════════════════════════════════════
describe("Signal — autocorrelate", () => {
  test("autocorrelation is symmetric", () => {
    const x = [1, 2, 3, 2, 1];
    const ac = Signal.autocorrelate(x);
    const n = ac.length;
    for (let i = 0; i < Math.floor(n / 2); i++) {
      close(ac[i], ac[n - 1 - i], 1e-9);
    }
  });

  test("autocorrelation peak at center", () => {
    const x = [1, 2, 3, 2, 1];
    const ac = Signal.autocorrelate(x);
    const center = Math.floor(ac.length / 2);
    expect(ac[center]).toBe(Math.max(...ac));
  });
});

// ═══════════════════════════════════════════════════════════════════
// MOVING AVERAGE / STD / VAR / MEDIAN
// ═══════════════════════════════════════════════════════════════════
describe("Signal — moving statistics", () => {
  test("movingAverage([0,1,2,3,4], 3) = [1,2,3]", () => {
    arrClose(Signal.movingAverage([0, 1, 2, 3, 4], 3), [1, 2, 3]);
  });

  test("movingAverage window=1 = original", () => {
    const x = [3, 1, 4, 1, 5];
    arrClose(Signal.movingAverage(x, 1), x);
  });

  test("movingStd output length = n - k + 1", () => {
    const x = [1, 2, 3, 4, 5, 6];
    const k = 3;
    expect(Signal.movingStd(x, k).length).toBe(x.length - k + 1);
  });

  test("movingStd of constant = all zeros", () => {
    const x = [5, 5, 5, 5, 5];
    arrClose(Signal.movingStd(x, 3), [0, 0, 0]);
  });

  test("movingVar of constant = all zeros", () => {
    arrClose(Signal.movingVar([7, 7, 7, 7], 2), [0, 0, 0]);
  });

  test("movingMedian of sorted sequence", () => {
    arrClose(Signal.movingMedian([1, 2, 3, 4, 5], 3), [2, 3, 4]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// WINDOW FUNCTIONS
// ═══════════════════════════════════════════════════════════════════
describe("Signal — window functions", () => {
  const n = 8;

  test("windowHann length = n", () =>
    expect(Signal.windowHann(n).length).toBe(n));
  test("windowHamming length = n", () =>
    expect(Signal.windowHamming(n).length).toBe(n));
  test("windowBlackman length = n", () =>
    expect(Signal.windowBlackman(n).length).toBe(n));
  test("windowBartlett length = n", () =>
    expect(Signal.windowBartlett(n).length).toBe(n));
  test("windowFlattop length = n", () =>
    expect(Signal.windowFlattop(n).length).toBe(n));
  test("windowKaiser length = n", () =>
    expect(Signal.windowKaiser(n, 5).length).toBe(n));
  test("windowGaussian length = n", () =>
    expect(Signal.windowGaussian(n, 0.4).length).toBe(n));

  test("Hann window endpoints ≈ 0", () => {
    const w = Signal.windowHann(n);
    close(w[0], 0, 1e-10);
    close(w[n - 1], 0, 1e-7); // periodic definition may differ
  });

  test("Hann window values in [0,1]", () => {
    Signal.windowHann(16).forEach((v) => {
      expect(v).toBeGreaterThanOrEqual(-1e-10);
      expect(v).toBeLessThanOrEqual(1 + 1e-10);
    });
  });

  test("Kaiser beta=0 ≈ rectangular (all values ≈1)", () => {
    const w = Signal.windowKaiser(7, 0);
    w.forEach((v) => close(v, 1, 1e-9));
  });

  test("Bartlett is symmetric", () => {
    const w = Signal.windowBartlett(9);
    for (let i = 0; i < Math.floor(w.length / 2); i++) {
      close(w[i], w[w.length - 1 - i], 1e-9);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════
// APPLY WINDOW
// ═══════════════════════════════════════════════════════════════════
describe("Signal — applyWindow", () => {
  test("multiply with rectangular window (all 1s) = original", () => {
    const signal = [1, 2, 3, 4, 5];
    const rect = () => Array(signal.length).fill(1);
    arrClose(Signal.applyWindow(signal, rect), signal);
  });

  test("applying window doubles in length matching signal", () => {
    const signal = [1, 2, 3, 4];
    const w = Signal.applyWindow(signal, Signal.windowHann);
    expect(w.length).toBe(signal.length);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FIR FILTERS
// ═══════════════════════════════════════════════════════════════════
describe("Signal — FIR filters", () => {
  test("firLowpass returns odd-length symmetric filter", () => {
    const h = Signal.firLowpass(0.25, 21);
    expect(h.length % 2).toBe(1); // odd length
    // symmetric
    for (let i = 0; i < Math.floor(h.length / 2); i++) {
      close(h[i], h[h.length - 1 - i], 1e-12);
    }
  });

  test("firHighpass returns odd-length symmetric filter", () => {
    const h = Signal.firHighpass(0.25, 21);
    expect(h.length % 2).toBe(1);
    // symmetric
    for (let i = 0; i < Math.floor(h.length / 2); i++) {
      close(h[i], h[h.length - 1 - i], 1e-12);
    }
  });

  test("firFilter passes DC unchanged through AC-blocking filter", () => {
    // Low-pass filter applied to DC signal should preserve it
    const h = Signal.firLowpass(0.4, 31); // pass up to 40% nyquist
    const signal = Array(128).fill(1); // DC signal
    const out = Signal.firFilter(signal, h);
    // after transient settling, output should be near 1
    const endValues = out.slice(-20);
    endValues.forEach((v) => close(v, 1, 0.15));
  });
});

// ═══════════════════════════════════════════════════════════════════
// RESAMPLE / ZERO PAD
// ═══════════════════════════════════════════════════════════════════
describe("Signal — resample / zeroPad", () => {
  test("resample returns target length", () => {
    expect(Signal.resample([0, 1, 2, 3], 7).length).toBe(7);
    expect(Signal.resample([0, 1, 2, 3, 4, 5, 6, 7], 4).length).toBe(4);
  });

  test("resample to same length = same signal", () => {
    const x = [1, 2, 3, 4];
    arrClose(Signal.resample(x, 4), x, 1e-6);
  });

  test("zeroPad([1,2,3], 5) = [1,2,3,0,0]", () => {
    arrClose(Signal.zeroPad([1, 2, 3], 5), [1, 2, 3, 0, 0]);
  });

  test("zeroPad with n < length truncates signal", () => {
    // source zeroPad truncates when n < length
    arrClose(Signal.zeroPad([1, 2, 3], 2), [1, 2]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// NORMALIZE
// ═══════════════════════════════════════════════════════════════════
describe("Signal — normalize", () => {
  test("[0, 2, 4] normalized to peak 1", () => {
    // normalize divides by peak absolute value, so max = 1
    arrClose(Signal.normalize([0, 2, 4]), [0, 0.5, 1]);
  });

  test("[3, 3, 3] normalize: peak is 3, all become 1", () => {
    // constant signal normalizes to 1 (each / peak)
    arrClose(Signal.normalize([3, 3, 3]), [1, 1, 1]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// RMS / ENERGY / POWER / SNR
// ═══════════════════════════════════════════════════════════════════
describe("Signal — rms / energy / power / snr", () => {
  test("rms([0, 1, 0, -1]) = 1/√2 ≈ 0.7071", () => {
    close(Signal.rms([0, 1, 0, -1]), 1 / Math.SQRT2, 1e-10);
  });

  test("rms([1,1,1,1]) = 1", () => {
    close(Signal.rms([1, 1, 1, 1]), 1);
  });

  test("energy([3,4]) = 25", () => {
    close(Signal.energy([3, 4]), 25);
  });

  test("energy([0,0]) = 0", () => {
    close(Signal.energy([0, 0]), 0);
  });

  test("power = energy / length", () => {
    const x = [1, 2, 3, 4];
    close(Signal.power(x), Signal.energy(x) / x.length, 1e-10);
  });

  test("snr: comparing signal to near-zero noise", () => {
    // snr computes power of `noisy` vs original signal; high SNR when noise << signal
    const signal = [1, 2, 3, 4, 5];
    const noise = Array(5).fill(1e-6);
    // snr(signal, noise) = 10*log10(power(signal)/power(noise))
    const snrVal = Signal.snr(signal, noise);
    expect(snrVal).toBeGreaterThan(50); // should be very large
  });
});

// ═══════════════════════════════════════════════════════════════════
// ZERO CROSSING RATE
// ═══════════════════════════════════════════════════════════════════
describe("Signal — zeroCrossingRate", () => {
  test("[1,-1,1,-1] alternating zcr = 1.0", () => {
    close(Signal.zeroCrossingRate([1, -1, 1, -1]), 1.0, 1e-9);
  });

  test("[1,1,1,1] no crossings → zcr = 0", () => {
    close(Signal.zeroCrossingRate([1, 1, 1, 1]), 0);
  });

  test("zcr is in [0,1]", () => {
    const x = [1, -2, 3, -1, 0, 1, -1];
    const zcr = Signal.zeroCrossingRate(x);
    expect(zcr).toBeGreaterThanOrEqual(0);
    expect(zcr).toBeLessThanOrEqual(1);
  });
});
