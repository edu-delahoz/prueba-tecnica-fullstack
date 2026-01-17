import type { NextApiRequest, NextApiResponse } from 'next';

import { isAuthError, requireSession, sendAuthError } from '@/lib/auth/rbac';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { user } = await requireSession(req);
    return res.status(200).json({ user });
  } catch (error) {
    if (isAuthError(error)) {
      return sendAuthError(res, error);
    }

    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
