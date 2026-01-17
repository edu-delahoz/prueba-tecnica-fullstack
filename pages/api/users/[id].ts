import type { NextApiRequest, NextApiResponse } from 'next';
import { Role } from '@prisma/client';
import { z } from 'zod';

import { isAuthError, requireAdmin, sendAuthError } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import { userSelect } from '@/lib/users/select';

const patchSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    role: z.nativeEnum(Role).optional(),
    phone: z.string().trim().min(1).optional(),
  })
  .refine((data) => data.name || data.role || data.phone, {
    message: 'At least one field must be provided',
  });

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await requireAdmin(req);

    const { id } = req.query;
    if (typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const parsed = patchSchema.safeParse(req.body);
    if (!parsed.success) {
      const [issue] = parsed.error.issues;
      return res
        .status(400)
        .json({ error: issue?.message ?? 'Invalid payload' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: userSelect,
    });

    return res.status(200).json({ data: updated });
  } catch (error) {
    if (isAuthError(error)) {
      return sendAuthError(res, error);
    }

    if (
      error instanceof Error &&
      error.message.includes('Record to update not found')
    ) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
