import { MovementType, Prisma } from '@prisma/client';
import { z } from 'zod';

// Accept both numeric JSON and string payloads so the API can receive form
// data. Everything is converted to Prisma.Decimal to preserve cents.
const amountSchema = z
  .union([z.number(), z.string().trim().min(1)])
  .transform((value) => (typeof value === 'number' ? value : Number(value)))
  .refine(Number.isFinite, {
    message: 'amount must be a positive number',
  })
  .refine((value) => value > 0, {
    message: 'amount must be a positive number',
  })
  .transform((value, ctx) => {
    try {
      return new Prisma.Decimal(value);
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'amount must be a positive number',
      });
      return z.NEVER;
    }
  });

/**
 * Input contract for POST /api/movements. Dates are normalized into actual
 * Date instances so downstream queries always persist ISO strings in UTC.
 */
export const movementCreateSchema = z.object({
  type: z.nativeEnum(MovementType),
  amount: amountSchema,
  concept: z.string().trim().min(1, { message: 'concept is required' }),
  date: z.union([z.string().trim(), z.date()]).transform((value, ctx) => {
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.valueOf())) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'date must be a valid ISO string',
      });
      return z.NEVER;
    }
    return parsed;
  }),
});

export type MovementCreateInput = z.infer<typeof movementCreateSchema>;
