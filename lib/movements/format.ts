import type { Prisma } from '@prisma/client';

export const movementSelect = {
  id: true,
  type: true,
  amount: true,
  concept: true,
  date: true,
  createdAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
} satisfies Prisma.MovementSelect;

export type MovementResponse = Prisma.MovementGetPayload<{
  select: typeof movementSelect;
}>;

export const formatMovement = (movement: MovementResponse) => ({
  ...movement,
  amount: movement.amount.toString(),
});
