import type { NextApiRequest, NextApiResponse } from 'next';

import { openApiSpec } from '@/lib/openapi/spec';

const cloneSpec = () => JSON.parse(JSON.stringify(openApiSpec));

const resolveOrigin = (req: NextApiRequest) => {
  const forwarded = req.headers['x-forwarded-proto'];
  const protoHeader = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const proto = protoHeader ?? 'http';
  const { host } = req.headers;
  if (!host) {
    return null;
  }
  return `${proto}://${host}`;
};

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const spec = cloneSpec();
  const origin = resolveOrigin(req);
  if (origin) {
    spec.servers = [
      {
        url: origin,
        description: 'Current environment',
      },
    ];
  }

  return res.status(200).json(spec);
};

export default handler;
