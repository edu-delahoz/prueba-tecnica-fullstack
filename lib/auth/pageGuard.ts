import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { fromNodeHeaders } from 'better-auth/node';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type RedirectReason = 'auth' | 'forbidden';

const redirectHome = (
  reason: RedirectReason
): GetServerSidePropsResult<never> => ({
  redirect: {
    destination: `/?reason=${reason}`,
    permanent: false,
  },
});

export const requireAdminPage = async (
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Record<string, never>>> => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(ctx.req.headers),
  });

  if (!session) {
    return redirectHome('auth');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!user || user.role !== 'ADMIN') {
    return redirectHome('forbidden');
  }

  return { props: {} };
};
