import type { NextApiRequest, NextApiResponse } from 'next';
import { fromNodeHeaders } from 'better-auth/node';
import type { Prisma } from '@prisma/client';
import { Role } from "@prisma/client";

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
} satisfies Prisma.UserSelect;

export type RbacUser = Prisma.UserGetPayload<{ select: typeof userSelect }>;
export type SessionPayload = NonNullable<
  Awaited<ReturnType<typeof auth.api.getSession>>
>;

// Shared error type so API routes can send consistent responses.
export class AuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const unauthorizedError = () => new AuthError(401, 'Unauthorized');
const forbiddenError = () => new AuthError(403, 'Forbidden');

export const getSessionFromReq = async (
  req: NextApiRequest
): Promise<SessionPayload | null> =>
  auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

export const requireSession = async (
  req: NextApiRequest
): Promise<{ session: SessionPayload; user: RbacUser }> => {
  const session = await getSessionFromReq(req);
  if (!session) {
    throw unauthorizedError();
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: userSelect,
  });

  if (!user) {
    throw unauthorizedError();
  }

  return { session, user };
};

export const requireAdmin = async (
  req: NextApiRequest
): Promise<{ session: SessionPayload; user: RbacUser }> => {
  const result = await requireSession(req);
  if (result.user.role !== Role.ADMIN) {
    throw forbiddenError();
  }

  return result;
};

export const isAuthError = (error: unknown): error is AuthError =>
  error instanceof AuthError;

export const sendAuthError = (res: NextApiResponse, error: AuthError) =>
  res.status(error.status).json({ error: error.message });
