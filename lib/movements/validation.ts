import { MovementType, Prisma } from '@prisma/client';
import { z } from 'zod';

const amountSchema = z
  .union([z.number(), z.string().trim().min(1)])
  .transform((value) => {
    if (typeof value === 'number') {
      return value;
    }
    return Number(value);
  })
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

const movementSchema = z.object({
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

export type MovementInput = z.infer<typeof movementSchema>;

export const validateMovement = (body: unknown) => {
  const result = movementSchema.safeParse(body);

  if (!result.success) {
    const [issue] = result.error.issues;
    const message = (() => {
      if (issue?.path?.[0] === 'type') {
        return 'type must be INCOME or EXPENSE';
      }
      return issue?.message ?? 'Invalid body';
    })();

    return {
      error: message,
    } as const;
  }

  return { data: result.data } as const;
};
