import type { ParsedUrlQuery } from 'querystring';

export type ReportGroup = 'day' | 'month';

export interface DateRange {
  from: Date;
  to: Date;
}

export class ReportsQueryError extends Error {}

const toSingleValue = (value?: string | string[]): string | undefined =>
  Array.isArray(value) ? value[0] : value;

const startOfDayUtc = (date: Date) =>
  new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  );

const endOfDayUtc = (date: Date) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

const shiftUtcDays = (date: Date, amount: number) => {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + amount);
  return shifted;
};

const parseDateInput = (value?: string | string[]): Date | undefined => {
  const single = toSingleValue(value);
  if (!single) {
    return undefined;
  }

  const parsed = new Date(single);
  if (Number.isNaN(parsed.getTime())) {
    throw new ReportsQueryError(`Invalid date: ${single}`);
  }
  return parsed;
};

/**
 * Normalizes the `group` query string into a valid enum value. Defaults to the
 * highest granularity ("day") because charts can always down-sample but never
 * infer missing detail.
 */
export const parseGroupParam = (value?: string | string[]): ReportGroup => {
  const single = toSingleValue(value);
  if (!single) {
    return 'day';
  }

  if (single === 'day' || single === 'month') {
    return single;
  }

  throw new ReportsQueryError(`Invalid group value: ${single}`);
};

/**
 * Resolves an inclusive UTC range for reports queries. When params are missing
 * we default to the last 30 days because that keeps Prisma queries bounded and
 * mirrors the UI copy ("Last 30 days"). Throws validation errors instead of
 * silently swapping values to prevent confusing exports.
 */
export const resolveDateRange = (query: ParsedUrlQuery): DateRange => {
  const to = parseDateInput(query.to);
  const from = parseDateInput(query.from);

  const resolvedTo = endOfDayUtc(to ?? new Date());
  const resolvedFrom = startOfDayUtc(
    from ?? shiftUtcDays(startOfDayUtc(resolvedTo), -29)
  );

  if (resolvedFrom > resolvedTo) {
    throw new ReportsQueryError('"from" cannot be after "to"');
  }

  return { from: resolvedFrom, to: resolvedTo };
};
