import type { NextApiRequest, NextApiResponse } from 'next';

import { isAuthError, requireAdmin, sendAuthError } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import { userSelect } from '@/lib/users/select';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await requireAdmin(req);

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: userSelect,
    });

    return res.status(200).json({ data: users });
  } catch (error) {
    if (isAuthError(error)) {
      return sendAuthError(res, error);
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
