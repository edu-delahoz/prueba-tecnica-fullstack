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

const parsePaginationParams = (query: NextApiRequest['query']) => {
  const toSingleValue = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const getNumericParam = (
    name: 'page' | 'limit',
    config: { defaultValue: number; min: number; max?: number }
  ) => {
    const single = toSingleValue(query[name]);
    if (!single) {
      return config.defaultValue;
    }

    const parsed = Number(single);
    if (!Number.isInteger(parsed) || parsed < config.min) {
      throw new Error(
        `"${name}" must be an integer greater than or equal to ${config.min}.`
      );
    }

    if (config.max && parsed > config.max) {
      throw new Error(`"${name}" cannot be greater than ${config.max}.`);
    }

    return parsed;
  };

  const page = getNumericParam('page', { defaultValue: 1, min: 1 });
  const limit = getNumericParam('limit', {
    defaultValue: 20,
    min: 1,
    max: 100,
  });

  return { page, limit };
};

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

  const skip = (pagination.page - 1) * pagination.limit;

  const [total, movements] = await Promise.all([
    prisma.movement.count(),
    prisma.movement.findMany({
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      select: movementSelect,
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
