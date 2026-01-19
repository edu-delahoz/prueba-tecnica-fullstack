import { useCallback, useEffect, useState } from 'react';

import type { Role, UserRow } from './types';

interface UseUsersOptions {
  enabled?: boolean;
  page?: number;
  limit?: number;
}

interface UpdatePayload {
  name?: string;
  role?: Role;
  phone?: string | null;
}

interface UsersResponse {
  data: UserRow[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface UpdateResponse {
  data: UserRow;
}

const buildDefaultMeta = (page: number, limit: number) => ({
  page,
  limit,
  total: 0,
  totalPages: 1,
});

export const useUsers = (options?: UseUsersOptions) => {
  const isEnabled = options?.enabled ?? true;
  const page = options?.page ?? 1;
  const limit = options?.limit ?? 20;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState(buildDefaultMeta(page, limit));

  const refresh = useCallback(async () => {
    if (!isEnabled) {
      setUsers([]);
      setMeta(buildDefaultMeta(page, limit));
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const search = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await fetch(`/api/users?${search.toString()}`);
      if (response.status === 401) {
        throw new Error('Please sign in to view users.');
      }
      if (response.status === 403) {
        throw new Error('Only admins can view users.');
      }
      if (!response.ok) {
        throw new Error('Unable to load users.');
      }
      const payload = (await response.json()) as UsersResponse;
      setUsers(payload.data);
      setMeta(
        payload.meta ?? {
          page,
          limit,
          total: payload.data.length,
          totalPages:
            payload.data.length === 0
              ? 1
              : Math.ceil(payload.data.length / Math.max(limit, 1)),
        }
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unexpected error loading users.'
      );
      setUsers([]);
      setMeta(buildDefaultMeta(page, limit));
    } finally {
      setLoading(false);
    }
  }, [isEnabled, page, limit]);

  const updateUser = useCallback(
    async (id: string, body: UpdatePayload) => {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 403) {
        throw new Error('Forbidden');
      }
      if (response.status === 404) {
        throw new Error('User not found');
      }

      const payload = (await response.json()) as UpdateResponse & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to update user.');
      }

      await refresh();
      return payload.data;
    },
    [refresh]
  );

  useEffect(() => {
    if (!isEnabled) {
      setUsers([]);
      setMeta(buildDefaultMeta(page, limit));
      setLoading(false);
      setError(null);
      return;
    }
    void refresh();
  }, [isEnabled, refresh, page, limit]);

  return {
    users,
    loading,
    error,
    refresh,
    updateUser,
    meta,
  };
};
