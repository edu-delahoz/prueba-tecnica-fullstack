export type ReportMovement = {
  type: 'INCOME' | 'EXPENSE';
  amount: string | number;
  concept?: string | null;
  date: string;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
};

export type ReportGroup = 'day' | 'month';

export type ReportPoint = {
  period: string;
  income: string;
  expense: string;
  net: string;
};

const HUNDRED = 100n;

const normalizeInput = (value: string | number) => {
  if (typeof value === 'number' || typeof value === 'bigint') {
    return value.toString();
  }
  return value ?? '';
};

const parseIntegerPart = (segment: string) =>
  BigInt(segment.length ? segment : '0');

const parseFractionPart = (segment: string) =>
  BigInt(`${segment}00`.slice(0, 2) || '0');

const toMinorUnits = (value: string | number): bigint => {
  const trimmed = normalizeInput(value).trim();
  if (!trimmed) {
    return 0n;
  }

  const numericValue = Number(trimmed);
  if (Number.isNaN(numericValue)) {
    return 0n;
  }

  const negative = trimmed.startsWith('-');
  const unsigned = negative ? trimmed.slice(1) : trimmed;
  const [integerPart = '0', fractionPart = ''] = unsigned.split('.');
  const result =
    parseIntegerPart(integerPart) * HUNDRED + parseFractionPart(fractionPart);
  return negative ? -result : result;
};

const formatAmount = (value: bigint): string => {
  const negative = value < 0n;
  const absolute = negative ? -value : value;
  const units = absolute / HUNDRED;
  const cents = absolute % HUNDRED;
  const formatted = `${units.toString()}.${cents.toString().padStart(2, '0')}`;
  return negative ? `-${formatted}` : formatted;
};

const formatPeriod = (isoDate: string, group: ReportGroup) => {
  const date = new Date(isoDate);
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, '0');
  if (group === 'month') {
    return `${year}-${month}`;
  }
  const day = `${date.getUTCDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const comparePeriods = (a: string, b: string) => {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
};

export const calculateTotals = (movements: ReportMovement[]) => {
  let income = 0n;
  let expense = 0n;

  for (const movement of movements) {
    const amount = toMinorUnits(movement.amount);
    if (movement.type === 'INCOME') {
      income += amount;
    } else {
      expense += amount;
    }
  }

  const balance = income - expense;

  return {
    totalIncome: formatAmount(income),
    totalExpense: formatAmount(expense),
    balance: formatAmount(balance),
  };
};

export const buildPoints = (
  movements: ReportMovement[],
  group: ReportGroup
): ReportPoint[] => {
  const buckets = new Map<string, { income: bigint; expense: bigint }>();

  for (const movement of movements) {
    const period = formatPeriod(movement.date, group);
    const existing = buckets.get(period) ?? { income: 0n, expense: 0n };
    const amount = toMinorUnits(movement.amount);

    if (movement.type === 'INCOME') {
      existing.income += amount;
    } else {
      existing.expense += amount;
    }

    buckets.set(period, existing);
  }

  return Array.from(buckets.entries())
    .sort(([a], [b]) => comparePeriods(a, b))
    .map(([period, values]) => ({
      period,
      income: formatAmount(values.income),
      expense: formatAmount(values.expense),
      net: formatAmount(values.income - values.expense),
    }));
};

const csvEscape = (value: string) => {
  const shouldQuote = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return shouldQuote ? `"${escaped}"` : escaped;
};

export const generateCsv = (movements: ReportMovement[]): string => {
  const header = 'type,amount,concept,date,userName,userEmail';
  const rows = [header];

  for (const movement of movements) {
    const formattedAmount = formatAmount(toMinorUnits(movement.amount));
    const { concept: rawConcept, date, user } = movement;
    const concept = rawConcept ?? '';
    const userName = user?.name ?? '';
    const userEmail = user?.email ?? '';

    const fields: [string, string, string, string, string, string] = [
      movement.type,
      formattedAmount,
      concept,
      date,
      userName,
      userEmail,
    ];
    const payload = fields.map((value) => csvEscape(value));

    rows.push(payload.join(','));
  }

  return rows.join('\n');
};
