import { Role } from '@prisma/client';
import { z } from 'zod';

export const userUpdateSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    role: z.nativeEnum(Role).optional(),
    phone: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.name || data.role || data.phone, {
    message: 'At least one field must be provided',
  });

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
