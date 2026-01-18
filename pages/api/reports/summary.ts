import type { NextApiRequest, NextApiResponse } from 'next';

import { isAuthError, requireAdmin, sendAuthError } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import {
  parseGroupParam,
  resolveDateRange,
  ReportsQueryError,
} from '@/lib/reports/params';
import {
  buildPoints,
  calculateTotals,
  type ReportMovement,
} from '@/lib/reports';

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

    const normalizedMovements: ReportMovement[] = movements.map((movement) => ({
      type: movement.type === 'INCOME' ? 'INCOME' : 'EXPENSE',
      amount: movement.amount.toString(),
      concept: null,
      date: movement.date.toISOString(),
    }));

    const totals = calculateTotals(normalizedMovements);
    const points = buildPoints(normalizedMovements, group);

    return res.status(200).json({
      data: {
        totalIncome: totals.totalIncome,
        totalExpense: totals.totalExpense,
        balance: totals.balance,
        points,
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
