class Range {
  static create(start: number, end: number, step = 1): number[] {
    const result: number[] = [];
    if (step > 0) for (let i = start; i <= end; i += step) result.push(i);
    else for (let i = start; i >= end; i += step) result.push(i);
    return result;
  }

  static includes(num: number, min: number, max: number): boolean {
    return num >= min && num <= max;
  }

  static wrap(num: number, min: number, max: number): number {
    const range = max - min;
    return ((((num - min) % range) + range) % range) + min;
  }

  static bounce(num: number, min: number, max: number): number {
    const range = max - min;
    const normalized = (((num - min) % (range * 2)) + range * 2) % (range * 2);
    return normalized <= range ? min + normalized : max - (normalized - range);
  }

  static chunk(start: number, end: number, chunkSize: number): number[][] {
    const chunks: number[][] = [];
    for (let i = start; i <= end; i += chunkSize) {
      chunks.push(Range.create(i, Math.min(i + chunkSize - 1, end)));
    }
    return chunks;
  }
}

export default Range;
