import { MovementType, Prisma } from '@prisma/client';
import { z } from 'zod';

const amountSchema = z
  .union([
    z
      .number({
        invalid_type_error: 'amount must be a number or string',
      })
      .finite(),
    z.string().trim().min(1, { message: 'amount must be a positive number' }),
  ])
  .transform((value, ctx) => {
    try {
      const decimal = new Prisma.Decimal(value);
      if (decimal.lte(0)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'amount must be a positive number',
        });
        return z.NEVER;
      }
      return decimal;
    } catch {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'amount must be a positive number',
      });
      return z.NEVER;
    }
  });

const movementSchema = z.object({
  type: z.nativeEnum(MovementType, {
    errorMap: () => ({ message: 'type must be INCOME or EXPENSE' }),
  }),
  amount: amountSchema,
  concept: z.string().trim().min(1, { message: 'concept is required' }),
  date: z.coerce
    .date({
      invalid_type_error: 'date must be an ISO string',
    })
    .refine((value) => !Number.isNaN(value.valueOf()), {
      message: 'date must be a valid ISO string',
    }),
});

export type MovementInput = z.infer<typeof movementSchema>;

export const validateMovement = (body: unknown) => {
  const result = movementSchema.safeParse(body);

  if (!result.success) {
    const [issue] = result.error.issues;
    return {
      error: issue?.message ?? 'Invalid body',
    } as const;
  }

  return { data: result.data } as const;
};
