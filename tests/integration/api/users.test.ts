import { beforeEach, describe, expect, it, vi } from 'vitest';

import handler from '@/pages/api/users';
import { createMockReqRes } from '@/tests/utils/api';

const createUser = (index: number) => ({
  id: `user-${index}`,
  name: `User ${index}`,
  email: `user${index}@example.com`,
  phone: `+1-202-555-01${index}`,
  role: index % 2 === 0 ? 'USER' : 'ADMIN',
  createdAt: new Date(
    `2024-02-${String(index).padStart(2, '0')}T00:00:00.000Z`
  ),
});

const userFixtures = Array.from({ length: 5 }, (_, index) =>
  createUser(index + 1)
);

const prismaMocks = vi.hoisted(() => ({
  userFindMany: vi.fn(),
  userCount: vi.fn(),
}));

const authMocks = vi.hoisted(() => ({
  requireAdmin: vi.fn(async () => ({
    session: { user: { id: 'admin-id' } },
    user: {
      id: 'admin-id',
      role: 'ADMIN',
      email: 'admin@example.com',
      name: 'Admin User',
      phone: null,
    },
  })),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findMany: prismaMocks.userFindMany,
      count: prismaMocks.userCount,
    },
    movement: {
      findMany: vi.fn(),
      count: vi.fn(),
    },
  },
}));

vi.mock('@/lib/auth/rbac', () => ({
  requireAdmin: authMocks.requireAdmin,
  isAuthError: vi.fn(() => false),
  sendAuthError: vi.fn(),
}));

type UsersResponse = {
  data: Array<{ id: string }>;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

describe('/api/users pagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    prismaMocks.userCount.mockResolvedValue(userFixtures.length);
    prismaMocks.userFindMany.mockImplementation(
      async ({ skip = 0, take }: { skip?: number; take?: number } = {}) => {
        const end = typeof take === 'number' ? skip + take : undefined;
        return userFixtures.slice(skip, end);
      }
    );
  });

  it('returns default pagination meta when params are omitted', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes();

    await handler(req, res);

    expect(getStatus()).toBe(200);
    const payload = getJSON() as UsersResponse;
    expect(payload.meta).toMatchObject({
      page: 1,
      limit: 20,
      total: userFixtures.length,
      totalPages: 1,
    });
    expect(payload.data.map((user) => user.id)).toEqual(
      userFixtures.map((user) => user.id)
    );
  });

  it('respects explicit page and limit params', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes({
      query: { page: '1', limit: '2' },
    });

    await handler(req, res);

    expect(getStatus()).toBe(200);
    const payload = getJSON() as UsersResponse;
    expect(payload.meta).toMatchObject({
      page: 1,
      limit: 2,
      total: userFixtures.length,
      totalPages: 3,
    });
    expect(payload.data.map((user) => user.id)).toEqual(['user-1', 'user-2']);
  });

  it('returns the next set of users for page 2', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes({
      query: { page: '2', limit: '2' },
    });

    await handler(req, res);

    expect(getStatus()).toBe(200);
    const payload = getJSON() as UsersResponse;
    expect(payload.data.map((user) => user.id)).toEqual(['user-3', 'user-4']);
  });

  it('returns 400 for invalid page', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes({
      query: { page: '0' },
    });

    await handler(req, res);

    expect(getStatus()).toBe(400);
    const payload = getJSON() as { error: string };
    expect(payload.error).toContain('"page" must be an integer');
    expect(prismaMocks.userCount).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid limit', async () => {
    const { req, res, getStatus, getJSON } = createMockReqRes({
      query: { limit: '101' },
    });

    await handler(req, res);

    expect(getStatus()).toBe(400);
    const payload = getJSON() as { error: string };
    expect(payload.error).toContain('"limit" cannot be greater than 100');
  });
});
