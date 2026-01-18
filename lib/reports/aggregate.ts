import { Prisma, MovementType } from '@prisma/client';

import type { ReportGroup } from './params';

export interface SummaryPoint {
  period: string;
  income: string;
  expense: string;
  net: string;
}

export interface SummaryResult {
  totalIncome: string;
  totalExpense: string;
  balance: string;
  points: SummaryPoint[];
}

type MovementSnippet = {
  date: Date;
  type: MovementType;
  amount: Prisma.Decimal;
};

const zero = new Prisma.Decimal(0);

const formatPeriod = (date: Date, group: ReportGroup) => {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  if (group === 'month') {
    return `${year}-${month}`;
  }
  const day = `${date.getUTCDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const serialize = (value: Prisma.Decimal) => value.toFixed(2);

const comparePeriods = (a: string, b: string) => {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
};

export const aggregateMovements = (
  movements: MovementSnippet[],
  group: ReportGroup
): SummaryResult => {
  const buckets = new Map<
    string,
    { income: Prisma.Decimal; expense: Prisma.Decimal }
  >();
  let totalIncome = zero;
  let totalExpense = zero;

  for (const movement of movements) {
    const period = formatPeriod(movement.date, group);
    const bucket = buckets.get(period) ?? { income: zero, expense: zero };

    if (movement.type === MovementType.INCOME) {
      const nextIncome = bucket.income.add(movement.amount);
      buckets.set(period, { ...bucket, income: nextIncome });
      totalIncome = totalIncome.add(movement.amount);
    } else {
      const nextExpense = bucket.expense.add(movement.amount);
      buckets.set(period, { ...bucket, expense: nextExpense });
      totalExpense = totalExpense.add(movement.amount);
    }
  }

  const points = Array.from(buckets.entries())
    .sort(([a], [b]) => comparePeriods(a, b))
    .map(([period, values]) => {
      const net = values.income.sub(values.expense);
      return {
        period,
        income: serialize(values.income),
        expense: serialize(values.expense),
        net: serialize(net),
      };
    });

  const balance = totalIncome.sub(totalExpense);

  return {
    totalIncome: serialize(totalIncome),
    totalExpense: serialize(totalExpense),
    balance: serialize(balance),
    points,
  };
};
