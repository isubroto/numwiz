export interface AmortizationEntry {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

class Financial {
  static simpleInterest(principal: number, rate: number, time: number): number {
    return (principal * rate * time) / 100;
  }

  static compoundInterest(
    principal: number,
    rate: number,
    time: number,
    n = 12
  ): number {
    const amount = principal * Math.pow(1 + rate / (n * 100), n * time);
    return amount - principal;
  }

  static emi(principal: number, annualRate: number, months: number): number {
    const r = annualRate / 12 / 100;
    return (
      (principal * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1)
    );
  }

  static futureValue(
    presentValue: number,
    rate: number,
    periods: number
  ): number {
    return presentValue * Math.pow(1 + rate / 100, periods);
  }

  static presentValue(
    futureValue: number,
    rate: number,
    periods: number
  ): number {
    return futureValue / Math.pow(1 + rate / 100, periods);
  }

  static roi(gain: number, cost: number): number {
    return ((gain - cost) / cost) * 100;
  }

  static cagr(startValue: number, endValue: number, years: number): number {
    return (Math.pow(endValue / startValue, 1 / years) - 1) * 100;
  }

  static grossProfit(revenue: number, cogs: number): number {
    return revenue - cogs;
  }
  static grossMargin(revenue: number, cogs: number): number {
    return ((revenue - cogs) / revenue) * 100;
  }
  static netProfit(revenue: number, expenses: number): number {
    return revenue - expenses;
  }
  static markup(cost: number, sellingPrice: number): number {
    return ((sellingPrice - cost) / cost) * 100;
  }
  static discount(originalPrice: number, discountPercent: number): number {
    return originalPrice * (1 - discountPercent / 100);
  }
  static taxAmount(amount: number, taxRate: number): number {
    return amount * (taxRate / 100);
  }
  static priceWithTax(amount: number, taxRate: number): number {
    return amount * (1 + taxRate / 100);
  }

  static sipFutureValue(
    monthlyInvestment: number,
    annualRate: number,
    years: number
  ): number {
    const r = annualRate / 12 / 100;
    const n = years * 12;
    return monthlyInvestment * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  }

  static amortizationSchedule(
    principal: number,
    annualRate: number,
    months: number
  ): AmortizationEntry[] {
    const monthlyRate = annualRate / 12 / 100;
    const emi = Financial.emi(principal, annualRate, months);
    const schedule: AmortizationEntry[] = [];
    let balance = principal;

    for (let i = 1; i <= months; i++) {
      const interest = balance * monthlyRate;
      const principalPaid = emi - interest;
      balance -= principalPaid;

      schedule.push({
        month: i,
        emi: Math.round(emi * 100) / 100,
        principal: Math.round(principalPaid * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        balance: Math.max(0, Math.round(balance * 100) / 100),
      });
    }
    return schedule;
  }
}

export default Financial;
