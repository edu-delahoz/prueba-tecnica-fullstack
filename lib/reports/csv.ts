import type { Prisma } from '@prisma/client';

type MovementCsvRow = Prisma.MovementGetPayload<{
  select: {
    type: true;
    amount: true;
    concept: true;
    date: true;
    user: {
      select: {
        name: true;
        email: true;
      };
    };
  };
}>;

const csvEscape = (value: string) => {
  const shouldQuote = /[",\n]/.test(value);
  const escaped = value.replace(/"/g, '""');
  return shouldQuote ? `"${escaped}"` : escaped;
};

export const buildMovementsCsv = (rows: MovementCsvRow[]): string => {
  const header = 'type,amount,concept,date,userName,userEmail';
  const lines = [header];

  for (const movement of rows) {
    const payload = [
      movement.type,
      movement.amount.toFixed(2),
      movement.concept ?? '',
      movement.date.toISOString(),
      movement.user?.name ?? '',
      movement.user?.email ?? '',
    ].map((value) => csvEscape(value));

    lines.push(payload.join(','));
  }

  return lines.join('\n');
};
