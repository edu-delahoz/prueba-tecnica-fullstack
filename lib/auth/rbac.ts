import type { NextApiRequest, NextApiResponse } from 'next';
import { fromNodeHeaders } from 'better-auth/node';
import type { Prisma } from '@prisma/client';
import { Role } from '@prisma/client';

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

// 401 keeps responses identical when the client is not authenticated or the
// session references a deleted user (prevents leaking account existence).
const unauthorizedError = () => new AuthError(401, 'Unauthorized');
// 403 is only returned when we know who the user is but they lack privileges.
const forbiddenError = () => new AuthError(403, 'Forbidden');

/**
 * Hydrates the current session (if any) from the API request headers.
 * Returns null instead of throwing so callers can decide whether to send 401.
 */
export const getSessionFromReq = async (
  req: NextApiRequest
): Promise<SessionPayload | null> =>
  auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

/**
 * Ensures requests have a valid session and that the referenced user still
 * exists in the database. We prefer throwing 401 in both "missing session"
 * and "orphaned session" scenarios so attackers cannot confirm deleted users.
 */
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

/**
 * Extends {@link requireSession} to enforce ADMIN role. This function throws
 * 403 when the session is valid but lacks privileges, which helps clients
 * differentiate between "sign in again" vs. "ask for more access".
 */
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

/**
 * Sends the correct HTTP status + JSON body for known auth errors so every
 * API route responds consistently (useful for frontend error handling).
 */
export const sendAuthError = (res: NextApiResponse, error: AuthError) =>
  res.status(error.status).json({ error: error.message });
