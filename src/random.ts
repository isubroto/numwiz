export interface WeightedItem<T = unknown> {
  value: T;
  weight: number;
}

class Random {
  static float(): number {
    return Math.random();
  }
  static floatBetween(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
  static intBetween(min: number, max: number): number {
    return (
      Math.floor(Math.random() * (Math.floor(max) - Math.ceil(min) + 1)) +
      Math.ceil(min)
    );
  }
  static boolean(): boolean {
    return Math.random() >= 0.5;
  }
  static pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  static shuffle<T>(arr: T[]): T[] {
    const c = [...arr];
    for (let i = c.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [c[i], c[j]] = [c[j], c[i]];
    }
    return c;
  }

  static sample<T>(arr: T[], count: number): T[] {
    return Random.shuffle(arr).slice(0, count);
  }
  static generateList(count: number, min = 0, max = 100): number[] {
    return Array.from({ length: count }, () => Random.intBetween(min, max));
  }
  static uniqueList(count: number, min = 0, max = 100): number[] {
    const set = new Set<number>();
    while (set.size < count && set.size < max - min + 1) {
      set.add(Random.intBetween(min, max));
    }
    return [...set];
  }

  static gaussian(mean = 0, stdDev = 1): number {
    const u = Math.random(),
      v = Math.random();
    return (
      Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * stdDev + mean
    );
  }

  static weighted<T>(items: WeightedItem<T>[]): T {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * total;
    for (const item of items) {
      r -= item.weight;
      if (r <= 0) return item.value;
    }
    return items[items.length - 1].value;
  }

  static dice(sides = 6): number {
    return Random.intBetween(1, sides);
  }
  static coin(): "heads" | "tails" {
    return Random.boolean() ? "heads" : "tails";
  }

  static uuid(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

export default Random;
