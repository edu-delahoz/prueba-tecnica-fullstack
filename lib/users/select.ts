import type { Prisma } from '@prisma/client';

export const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export type UserPayload = Prisma.UserGetPayload<{ select: typeof userSelect }>;
