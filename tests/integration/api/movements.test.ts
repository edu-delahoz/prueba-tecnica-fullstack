import { beforeEach, describe, expect, it, vi } from 'vitest';

import handler from '@/pages/api/movements';
import { createMockReqRes } from '@/tests/utils/api';

const createMovement = (index: number) => ({
  id: `mov-${index}`,
  type: index % 2 === 0 ? 'EXPENSE' : 'INCOME',
  amount: {
    toString: () => (index * 50).toFixed(2),
  },
  concept: `Movement ${index}`,
  date: new Date(`2024-01-${String(index).padStart(2, '0')}T00:00:00.000Z`),
  createdAt: new Date(
    `2024-01-${String(index).padStart(2, '0')}T00:00:00.000Z`
  ),
  user: {
    id: `user-${index}`,
    name: `User ${index}`,
    email: `user${index}@example.com`,
  },
});

const movementFixtures = Array.from({ length: 5 }, (_, index) =>
  createMovement(index + 1)
);

const prismaMocks = vi.hoisted(() => ({
  movementFindMany: vi.fn(),
  movementCount: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  requireSession: vi.fn(async () => ({
    session: { user: { id: 'session-user' } },
    user: {
      id: 'session-user',
      role: 'ADMIN',
      email: 'session@example.com',
      name: 'Session User',
      phone: null,
    },
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    movement: {
      findMany: prismaMocks.movementFindMany,
      count: prismaMocks.movementCount,
    },
    user: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth/rbac', () => ({
  requireSession: authMocks.requireSession,
  requireAdmin: vi.fn((req) => authMocks.requireSession(req)),
  isAuthError: vi.fn(() => false),
  sendAuthError: vi.fn(),
}));

type MovementsResponse = {
  data: Array<{ id: string }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

describe('/api/movements pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.movementCount.mockResolvedValue(movementFixtures.length);
    prismaMocks.movementFindMany.mockImplementation(
      async ({ skip = 0, take }: { skip?: number; take?: number } = {}) => {
        const end = typeof take === 'number' ? skip + take : undefined;
        return movementFixtures.slice(skip, end);
      }
    );
  });

  it('returns default pagination meta when no params are provided', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes();

    await handler(req, res);

    expect(getStatus()).toBe(200);
    const payload = getJSON() as MovementsResponse;
    expect(payload.meta).toMatchObject({
      page: 1,
      limit: 20,
      total: movementFixtures.length,
      totalPages: 1,
    });
    expect(payload.data.map((movement) => movement.id)).toEqual(
      movementFixtures.map((movement) => movement.id)
    );
  });

  it('returns the requested slice when limit is provided', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes({
      query: { page: '1', limit: '2' },
    });

    await handler(req, res);

    expect(getStatus()).toBe(200);
    const payload = getJSON() as MovementsResponse;
    expect(payload.data).toHaveLength(2);
    expect(payload.data.map((item) => item.id)).toEqual(['mov-1', 'mov-2']);
    expect(payload.meta).toMatchObject({
      page: 1,
      limit: 2,
      total: movementFixtures.length,
      totalPages: 3,
    });
  });

  it('returns the next slice when requesting page 2', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes({
      query: { page: '2', limit: '2' },
    });

    await handler(req, res);

    expect(getStatus()).toBe(200);
    const payload = getJSON() as MovementsResponse;
    expect(payload.data.map((item) => item.id)).toEqual(['mov-3', 'mov-4']);
    expect(payload.meta.page).toBe(2);
    expect(payload.meta.limit).toBe(2);
  });

  it('returns 400 when page is invalid', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes({
      query: { page: '0' },
    });

    await handler(req, res);

    expect(getStatus()).toBe(400);
    const payload = getJSON() as { error: string };
    expect(payload.error).toContain('"page" must be an integer');
    expect(prismaMocks.movementCount).not.toHaveBeenCalled();
  });

  it('returns 400 when limit is greater than max', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes({
      query: { limit: '1000' },
    });

    await handler(req, res);

    expect(getStatus()).toBe(400);
    const payload = getJSON() as { error: string };
    expect(payload.error).toContain('"limit" cannot be greater than 100');
  });
});
