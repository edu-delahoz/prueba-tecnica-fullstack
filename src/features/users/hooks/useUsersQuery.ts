import { useCallback, useEffect, useState } from 'react';

import type { UserRow } from '@/lib/users/types';

interface UseUsersQueryOptions {
  page: number;
  limit: number;
  enabled: boolean;
  search?: string;
}

export interface UsersMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const buildDefaultMeta = (page: number, limit: number): UsersMeta => ({
  page,
  limit,
  total: 0,
  totalPages: 1,
});

export const useUsersQuery = ({
  page,
  limit,
  enabled,
  search,
}: UseUsersQueryOptions) => {
  const [data, setData] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState<UsersMeta>(buildDefaultMeta(page, limit));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!enabled) {
      setData([]);
      setMeta(buildDefaultMeta(page, limit));
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search && search.length > 0) {
        params.append('search', search);
      }
      const response = await fetch(`/api/users?${params.toString()}`);
      const authMessages: Record<number, string> = {
        401: 'Please sign in to view users.',
        403: 'Only admins can view users.',
      };
      const authError = authMessages[response.status];
      if (authError) {
        throw new Error(authError);
      }
      if (!response.ok) {
        throw new Error('Unable to load users.');
      }
      const payload = (await response.json()) as {
        data: UserRow[];
        meta?: UsersMeta;
      };
      setData(payload.data);
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
      setData([]);
      setMeta(buildDefaultMeta(page, limit));
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unexpected error loading users.'
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, page, limit, search]);

  useEffect(() => {
    void fetchUsers();
  }, [fetchUsers]);

  return {
    data,
    meta,
    loading,
    error,
    refresh: fetchUsers,
  };
};
