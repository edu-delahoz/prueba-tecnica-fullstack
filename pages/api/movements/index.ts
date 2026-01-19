import type { MovementType } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  isAuthError,
  requireAdmin,
  requireSession,
  sendAuthError,
} from '@/lib/auth/rbac';
import { formatMovement, movementSelect } from '@/lib/movements/format';
import { prisma } from '@/lib/prisma';
import { movementCreateSchema } from '@/lib/validation/movements';
import {
  parsePaginationParams,
  parseSearchParam,
} from '@/src/utils/pagination';

const handleGet = async (req: NextApiRequest, res: NextApiResponse) => {
  await requireSession(req);

  let pagination: { page: number; limit: number };
  try {
    pagination = parsePaginationParams(req.query);
  } catch (error) {
    return res.status(400).json({
      error: error instanceof Error ? error.message : 'Invalid query',
    });
  }

  const search = parseSearchParam(req.query);
  const normalizedSearch = search?.toUpperCase();
  const typeFilter =
    normalizedSearch === 'INCOME' || normalizedSearch === 'EXPENSE'
      ? (normalizedSearch as MovementType)
      : undefined;
  const where = search
    ? {
        OR: [
          { concept: { contains: search, mode: 'insensitive' as const } },
          ...(typeFilter ? [{ type: typeFilter }] : []),
        ],
      }
    : undefined;

  const skip = (pagination.page - 1) * pagination.limit;

  const [total, movements] = await Promise.all([
    prisma.movement.count({ where }),
    prisma.movement.findMany({
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      select: movementSelect,
      where,
      skip,
      take: pagination.limit,
    }),
  ]);

  const totalPages =
    total === 0 ? 0 : Math.ceil(total / Math.max(1, pagination.limit));

  return res.status(200).json({
    data: movements.map(formatMovement),
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,
      totalPages,
    },
  });
};

const handlePost = async (req: NextApiRequest, res: NextApiResponse) => {
  const { session } = await requireAdmin(req);

  const validation = movementCreateSchema.safeParse(req.body);
  if (!validation.success) {
    const [issue] = validation.error.issues;
    const message =
      issue?.path?.[0] === 'type'
        ? 'type must be INCOME or EXPENSE'
        : (issue?.message ?? 'Invalid body');
    return res.status(400).json({ error: message });
  }

  const created = await prisma.movement.create({
    data: {
      ...validation.data,
      userId: session.user.id,
    },
    select: movementSelect,
  });

  return res.status(201).json({
    data: formatMovement(created),
  });
};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    if (req.method === 'GET') {
      return await handleGet(req, res);
    }

    if (req.method === 'POST') {
      return await handlePost(req, res);
    }

    res.setHeader('Allow', 'GET, POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (error) {
    if (isAuthError(error)) {
      return sendAuthError(res, error);
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
