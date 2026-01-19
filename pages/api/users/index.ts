import type { NextApiRequest, NextApiResponse } from 'next';

import { isAuthError, requireAdmin, sendAuthError } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import { userSelect } from '@/lib/users/select';
import {
  parsePaginationParams,
  parseSearchParam,
} from '@/src/utils/pagination';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await requireAdmin(req);

    let pagination: { page: number; limit: number };
    try {
      pagination = parsePaginationParams(req.query);
    } catch (error) {
      return res.status(400).json({
        error: error instanceof Error ? error.message : 'Invalid query',
      });
    }

    const search = parseSearchParam(req.query);
    const where = search
      ? {
          OR: [
            {
              name: { contains: search, mode: 'insensitive' as const },
            },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const skip = (pagination.page - 1) * pagination.limit;

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        select: userSelect,
        where,
        skip,
        take: pagination.limit,
      }),
    ]);

    const totalPages =
      total === 0 ? 0 : Math.ceil(total / Math.max(1, pagination.limit));

    return res.status(200).json({
      data: users,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    if (isAuthError(error)) {
      return sendAuthError(res, error);
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
