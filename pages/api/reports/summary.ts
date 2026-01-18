import type { NextApiRequest, NextApiResponse } from 'next';

import { isAuthError, requireAdmin, sendAuthError } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import { aggregateMovements } from '@/lib/reports/aggregate';
import {
  parseGroupParam,
  resolveDateRange,
  ReportsQueryError,
} from '@/lib/reports/params';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await requireAdmin(req);

    const group = parseGroupParam(req.query.group);
    const range = resolveDateRange(req.query);

    const movements = await prisma.movement.findMany({
      where: {
        date: {
          gte: range.from,
          lte: range.to,
        },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
    });

    const summary = aggregateMovements(movements, group);

    return res.status(200).json({
      data: {
        totalIncome: summary.totalIncome,
        totalExpense: summary.totalExpense,
        balance: summary.balance,
        points: summary.points,
        group,
        range: {
          from: range.from.toISOString(),
          to: range.to.toISOString(),
        },
      },
    });
  } catch (error) {
    if (isAuthError(error)) {
      return sendAuthError(res, error);
    }
    if (error instanceof ReportsQueryError) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

export default handler;
