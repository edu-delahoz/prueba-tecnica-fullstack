import { describe, it, expect } from 'vitest';

import {
  buildPoints,
  calculateTotals,
  generateCsv,
  type ReportMovement,
} from '@/lib/reports';

const makeMovement = (partial: Partial<ReportMovement>): ReportMovement => ({
  type: 'INCOME',
  amount: '0.01',
  concept: '',
  date: '2026-01-01T00:00:00.000Z',
  user: { name: '', email: '' },
  ...partial,
});

describe('reports edge cases', () => {
  it('escapes commas, quotes, and new lines in CSV output', () => {
    const movements: ReportMovement[] = [
      makeMovement({
        concept: 'SaaS, subscription',
        amount: '10',
        user: { name: 'Comma, Name', email: 'comma@example.com' },
      }),
      makeMovement({
        concept: 'He said "ok"',
        amount: '20',
        user: { name: 'Quote "Name"', email: 'quote@example.com' },
        date: '2026-01-02T00:00:00.000Z',
      }),
      makeMovement({
        concept: 'Line1\nLine2',
        amount: '30',
        user: { name: 'Multiline', email: 'line@example.com' },
        date: '2026-01-03T00:00:00.000Z',
      }),
    ];

    const csv = generateCsv(movements);
    expect(csv.startsWith('type,amount,concept,date,userName,userEmail')).toBe(
      true
    );
    expect(csv).toContain('"SaaS, subscription"');
    expect(csv).toContain('"Comma, Name"');
    expect(csv).toContain('"He said ""ok"""');
    expect(csv).toContain('"Quote ""Name"""');
    expect(csv).toContain('"Line1\nLine2"');
  });

  it('returns zero totals and no points when no movements', () => {
    const totals = calculateTotals([]);
    const points = buildPoints([], 'day');

    expect(totals).toEqual({
      totalIncome: '0.00',
      totalExpense: '0.00',
      balance: '0.00',
    });
    expect(points).toEqual([]);
  });

  it('orders points ascending and keeps net consistent for daily grouping', () => {
    const movements: ReportMovement[] = [
      makeMovement({
        date: '2026-02-10T00:00:00.000Z',
        amount: '20.00',
        type: 'EXPENSE',
      }),
      makeMovement({
        date: '2026-01-01T00:00:00.000Z',
        amount: '50.00',
        type: 'INCOME',
      }),
      makeMovement({
        date: '2026-01-01T12:00:00.000Z',
        amount: '30.00',
        type: 'EXPENSE',
      }),
      makeMovement({
        date: '2026-02-11T00:00:00.000Z',
        amount: '70.00',
        type: 'INCOME',
      }),
    ];

    const points = buildPoints(movements, 'day');
    const periods = points.map((point) => point.period);
    expect(periods).toEqual(['2026-01-01', '2026-02-10', '2026-02-11']);

    points.forEach((point) => {
      const net = Number(point.income) - Number(point.expense);
      expect(net.toFixed(2)).toBe(point.net);
    });
  });

  it('groups movements by month with ordered periods', () => {
    const movements: ReportMovement[] = [
      makeMovement({
        date: '2026-01-05T00:00:00.000Z',
        amount: '100.00',
        type: 'INCOME',
      }),
      makeMovement({
        date: '2026-01-20T00:00:00.000Z',
        amount: '40.00',
        type: 'EXPENSE',
      }),
      makeMovement({
        date: '2026-02-10T00:00:00.000Z',
        amount: '60.00',
        type: 'INCOME',
      }),
    ];

    const points = buildPoints(movements, 'month');
    expect(points).toEqual([
      { period: '2026-01', income: '100.00', expense: '40.00', net: '60.00' },
      { period: '2026-02', income: '60.00', expense: '0.00', net: '60.00' },
    ]);
  });
});
