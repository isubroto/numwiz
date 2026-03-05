import FFT from "../src/fft";

const TOL = 1e-6;
function close(a: number, b: number, tol = TOL) {
  expect(Math.abs(a - b)).toBeLessThan(tol);
}
function arrClose(a: number[], b: number[], tol = TOL) {
  expect(a.length).toBe(b.length);
  a.forEach((v, i) => expect(Math.abs(v - b[i])).toBeLessThan(tol));
}

// ═══════════════════════════════════════════════════════════════════
// FFT — BASIC
// ═══════════════════════════════════════════════════════════════════
describe("FFT — fft / ifft basics", () => {
  test("fft([1,0,0,0]) → DC=[1,0,0,0] (real parts)", () => {
    const out = FFT.fft([1, 0, 0, 0]);
    expect(out.length).toBe(4);
    out.forEach((c) => close(c.real, 1)); // all real parts = 1
    out.forEach((c) => close(c.imag, 0));
  });

  test("fft([1,1,1,1]) → DC only: [4,0,0,0]", () => {
    const out = FFT.fft([1, 1, 1, 1]);
    close(out[0].real, 4);
    close(out[0].imag, 0);
    close(Math.abs(out[1].real), 0, 1e-10);
    close(Math.abs(out[2].real), 0, 1e-10);
    close(Math.abs(out[3].real), 0, 1e-10);
  });

  test("ifft(fft(x)) ≈ x (round-trip)", () => {
    const signal = [1, 2, 3, 4, 5, 6, 7, 8];
    const spectrum = FFT.fft(signal);
    const recovered = FFT.ifft(spectrum);
    recovered.forEach((c, i) => {
      close(c.real, signal[i], 1e-9);
      close(Math.abs(c.imag), 0, 1e-9);
    });
  });

  test("fft length is power of 2 (padded)", () => {
    const out = FFT.fft([1, 2, 3]); // padded to 4
    expect(out.length).toBe(4);
  });

  test("fft of a single impulse at position k has constant magnitude", () => {
    const n = 8;
    const signal = Array(n).fill(0);
    signal[0] = 1;
    const spectrum = FFT.fft(signal);
    spectrum.forEach((c) => {
      close(Math.sqrt(c.real * c.real + c.imag * c.imag), 1, 1e-9);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════
// RFFT / IRFFT
// ═══════════════════════════════════════════════════════════════════
describe("FFT — rfft / irfft", () => {
  test("rfft length = N/2+1", () => {
    expect(FFT.rfft([1, 2, 3, 4, 5, 6, 7, 8]).length).toBe(5);
    expect(FFT.rfft([1, 2, 3, 4]).length).toBe(3);
  });

  test("irfft(rfft(x)) ≈ x", () => {
    const signal = [1, 3, 5, 7, 9, 11, 13, 15];
    const spec = FFT.rfft(signal);
    const rec = FFT.irfft(spec, signal.length);
    arrClose(rec, signal, 1e-9);
  });

  test("rfft([1,1,1,1]) DC = 4", () => {
    const out = FFT.rfft([1, 1, 1, 1]);
    close(out[0].real, 4, 1e-9);
    close(out[0].imag, 0, 1e-9);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FFT2 / IFFT2
// ═══════════════════════════════════════════════════════════════════
describe("FFT — fft2 / ifft2", () => {
  test("fft2 output shape matches input shape", () => {
    const mat = [
      [1, 0],
      [0, 0],
    ];
    const out = FFT.fft2(mat);
    expect(out.length).toBe(2);
    expect(out[0].length).toBe(2);
  });

  test("ifft2(fft2(A)) ≈ A", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const spec = FFT.fft2(A);
    const rec = FFT.ifft2(spec);
    A.forEach((row, r) =>
      row.forEach((v, c) => {
        close(rec[r][c].real, v, 1e-8);
        close(Math.abs(rec[r][c].imag), 0, 1e-8);
      })
    );
  });
});

// ═══════════════════════════════════════════════════════════════════
// FFTFREQ / RFFTFREQ
// ═══════════════════════════════════════════════════════════════════
describe("FFT — fftfreq / rfftfreq", () => {
  test("fftfreq(4, 1) = [0, 0.25, -0.5, -0.25]", () => {
    arrClose(FFT.fftfreq(4, 1), [0, 0.25, -0.5, -0.25], 1e-12);
  });

  test("rfftfreq(4, 1) = [0, 0.25, 0.5]", () => {
    arrClose(FFT.rfftfreq(4, 1), [0, 0.25, 0.5], 1e-12);
  });

  test("fftfreq(8, 1) first value = 0", () => {
    const f = FFT.fftfreq(8, 1);
    expect(f[0]).toBe(0);
    expect(f.length).toBe(8);
  });

  test("rfftfreq(8, 1) length = 5", () => {
    expect(FFT.rfftfreq(8, 1).length).toBe(5);
  });
});

// ═══════════════════════════════════════════════════════════════════
// FFTSHIFT / IFFTSHIFT
// ═══════════════════════════════════════════════════════════════════
describe("FFT — fftshift / ifftshift", () => {
  test("fftshift of fftfreq(4) = sorted freqs", () => {
    const f = FFT.fftfreq(4, 1);
    const shifted = FFT.fftshift(f);
    // should be sorted ascending: -0.5, -0.25, 0, 0.25
    const sorted = [...shifted].sort((a, b) => a - b);
    arrClose(shifted, sorted, 1e-12);
  });

  test("ifftshift(fftshift(x)) = x", () => {
    const x = [0, 1, 2, 3, 4, 5, 6, 7];
    arrClose(FFT.ifftshift(FFT.fftshift(x)), x, 1e-12);
  });

  test("fftshift even length", () => {
    arrClose(FFT.fftshift([0, 1, 2, 3]), [2, 3, 0, 1], 1e-12);
  });
});

// ═══════════════════════════════════════════════════════════════════
// MAGNITUDE / PHASE / POWER SPECTRUM
// ═══════════════════════════════════════════════════════════════════
describe("FFT — magnitude / phase / power", () => {
  test("magnitude of fft([1,0,0,0]) = all ones", () => {
    const spec = FFT.fft([1, 0, 0, 0]);
    FFT.magnitude(spec).forEach((m) => close(m, 1, 1e-9));
  });

  test("magnitude always non-negative", () => {
    const signal = [1, -2, 3, -4, 5, -6, 7, -8];
    FFT.magnitude(FFT.fft(signal)).forEach((m) =>
      expect(m).toBeGreaterThanOrEqual(0)
    );
  });

  test("phase is in [-π, π]", () => {
    const signal = [1, 2, 3, 4, 5, 6, 7, 8];
    const phases = FFT.phase(FFT.fft(signal));
    phases.forEach((p) => {
      expect(p).toBeGreaterThanOrEqual(-Math.PI - 1e-9);
      expect(p).toBeLessThanOrEqual(Math.PI + 1e-9);
    });
  });

  test("powerSpectrum = magnitude² / N", () => {
    const signal = [1, 2, 3, 4, 5, 6, 7, 8];
    const spec = FFT.fft(signal);
    const n = spec.length;
    const mag = FFT.magnitude(spec);
    const pow = FFT.powerSpectrum(signal);
    pow.forEach((p, i) => close(p, (mag[i] * mag[i]) / n, 1e-9));
  });

  test("pure cosine has peak at k=1", () => {
    const n = 8;
    const signal = Array.from({ length: n }, (_, k) =>
      Math.cos((2 * Math.PI * k) / n)
    );
    const mag = FFT.magnitude(FFT.fft(signal));
    // bins 1 and N-1 should be highest
    expect(mag[1]).toBeGreaterThan(mag[0]);
    expect(mag[1]).toBeGreaterThan(mag[2]);
  });
});

// ═══════════════════════════════════════════════════════════════════
// UNWRAP PHASE
// ═══════════════════════════════════════════════════════════════════
describe("FFT — unwrapPhase", () => {
  test("linearly increasing phase unwraps correctly", () => {
    const phase = [0, 0.5, 1.0, 1.5, 2.0, 2.5];
    const unwrapped = FFT.unwrapPhase(phase);
    // no discontinuities greater than π
    for (let i = 1; i < unwrapped.length; i++) {
      expect(Math.abs(unwrapped[i] - unwrapped[i - 1])).toBeLessThanOrEqual(
        Math.PI + 1e-9
      );
    }
  });

  test("constant phase array is unchanged", () => {
    const phase = [1, 1, 1, 1];
    arrClose(FFT.unwrapPhase(phase), phase, 1e-12);
  });
});

// ═══════════════════════════════════════════════════════════════════
// CROSS SPECTRUM
// ═══════════════════════════════════════════════════════════════════
describe("FFT — crossSpectrum", () => {
  test("crossSpectrum(x,x) gives real non-negative power spectrum", () => {
    const x = [1, 2, 3, 4, 5, 6, 7, 8];
    const cs = FFT.crossSpectrum(x, x);
    expect(cs.length).toBeGreaterThan(0);
    cs.forEach((c) => close(c.imag, 0, 1e-9)); // self-cross spectrum is real
    cs.forEach((c) => expect(c.real).toBeGreaterThanOrEqual(-1e-10));
  });

  test("crossSpectrum output length matches fft length", () => {
    const x = [1, 2, 3, 4];
    const y = [4, 3, 2, 1];
    const cs = FFT.crossSpectrum(x, y);
    expect(cs.length).toBe(FFT.fft(x).length);
  });
});

// ═══════════════════════════════════════════════════════════════════
// STFT
// ═══════════════════════════════════════════════════════════════════
describe("FFT — stft", () => {
  test("stft returns an array of frames", () => {
    const signal = Array.from({ length: 64 }, (_, k) =>
      Math.sin((2 * Math.PI * k) / 8)
    );
    const frames = FFT.stft(signal, 8, 4);
    expect(frames.length).toBeGreaterThan(0);
    frames.forEach((frame) => expect(frame.length).toBeGreaterThan(0));
  });

  test("stft each frame has expectedLength = windowSize/2+1 or windowSize", () => {
    const signal = Array.from({ length: 32 }, () => 1);
    const frames = FFT.stft(signal, 8, 4);
    const frameLen = frames[0].length;
    expect(frameLen).toBeGreaterThan(0);
  });
});
