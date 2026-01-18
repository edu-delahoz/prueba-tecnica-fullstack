import { describe, it, expect } from 'vitest';

import {
  buildPoints,
  calculateTotals,
  generateCsv,
  type ReportMovement,
} from '@/lib/reports';

const baseMovements: ReportMovement[] = [
  {
    type: 'INCOME',
    amount: '100.00',
    concept: 'Consulting',
    date: '2026-01-01T00:00:00.000Z',
    user: { name: 'Ada', email: 'ada@example.com' },
  },
  {
    type: 'EXPENSE',
    amount: '40.00',
    concept: 'Snacks',
    date: '2026-01-01T12:00:00.000Z',
    user: { name: 'Ops', email: 'ops@example.com' },
  },
  {
    type: 'INCOME',
    amount: '50.25',
    concept: 'Support',
    date: '2026-01-02T00:00:00.000Z',
    user: { name: 'Ben', email: 'ben@example.com' },
  },
  {
    type: 'EXPENSE',
    amount: '10.75',
    concept: 'Hosting',
    date: '2026-02-01T00:00:00.000Z',
    user: { name: null, email: 'infra@example.com' },
  },
  {
    type: 'INCOME',
    amount: '25.50',
    concept: 'Affiliate',
    date: '2026-02-10T00:00:00.000Z',
    user: { name: 'Eva', email: 'eva@example.com' },
  },
];

describe('report helpers', () => {
  it('calculateTotals sums income/expense and balance', () => {
    const totals = calculateTotals(baseMovements);
    expect(totals.totalIncome).toBe('175.75');
    expect(totals.totalExpense).toBe('50.75');
    expect(totals.balance).toBe('125.00');
  });

  it('buildPoints aggregates by day with stable order', () => {
    const points = buildPoints(baseMovements, 'day');
    expect(points).toEqual([
      { period: '2026-01-01', income: '100.00', expense: '40.00', net: '60.00' },
      { period: '2026-01-02', income: '50.25', expense: '0.00', net: '50.25' },
      { period: '2026-02-01', income: '0.00', expense: '10.75', net: '-10.75' },
      { period: '2026-02-10', income: '25.50', expense: '0.00', net: '25.50' },
    ]);
  });

  it('buildPoints aggregates by month', () => {
    const points = buildPoints(baseMovements, 'month');
    expect(points).toEqual([
      { period: '2026-01', income: '150.25', expense: '40.00', net: '110.25' },
      { period: '2026-02', income: '25.50', expense: '10.75', net: '14.75' },
    ]);
  });

  it('generateCsv outputs header and rows', () => {
    const csv = generateCsv(baseMovements);
    const rows = csv.split('\n');
    expect(rows[0]).toBe('type,amount,concept,date,userName,userEmail');
    expect(rows).toHaveLength(baseMovements.length + 1);
    expect(rows[1]).toContain('Consulting');
  });

  it('generateCsv escapes commas, quotes, and new lines', () => {
    const tricky: ReportMovement[] = [
      {
        type: 'INCOME',
        amount: '123.00',
        concept: 'Promo, "special"\nLine',
        date: '2026-03-05T00:00:00.000Z',
        user: { name: 'Test', email: 'test@example.com' },
      },
    ];

    const csv = generateCsv(tricky);
    expect(csv).toContain('"Promo, ""special""\nLine"');
  });
});

