import type { NextApiRequest, NextApiResponse } from 'next';

import { isAuthError, requireAdmin, sendAuthError } from '@/lib/auth/rbac';
import { prisma } from '@/lib/prisma';
import { buildMovementsCsv } from '@/lib/reports/csv';
import { resolveDateRange, ReportsQueryError } from '@/lib/reports/params';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    await requireAdmin(req);
    const range = resolveDateRange(req.query);

    const movements = await prisma.movement.findMany({
      where: {
        date: {
          gte: range.from,
          lte: range.to,
        },
      },
      orderBy: [{ date: 'asc' }, { createdAt: 'asc' }],
      select: {
        type: true,
        amount: true,
        concept: true,
        date: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    const csv = buildMovementsCsv(movements);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
    return res.status(200).send(csv);
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
