import { useCallback, useEffect, useState } from 'react';

import type { Role, UserRow } from './types';

interface UseUsersOptions {
  enabled?: boolean;
}

interface UpdatePayload {
  name?: string;
  role?: Role;
  phone?: string | null;
}

interface UsersResponse {
  data: UserRow[];
}

interface UpdateResponse {
  data: UserRow;
}

export const useUsers = (options?: UseUsersOptions) => {
  const isEnabled = options?.enabled ?? true;
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isEnabled) {
      setUsers([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/users');
      if (response.status === 401) {
        throw new Error('Unauthorized');
      }
      if (response.status === 403) {
        throw new Error('Forbidden');
      }
      if (!response.ok) {
        throw new Error('Unable to load users.');
      }
      const payload = (await response.json()) as UsersResponse;
      setUsers(payload.data);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unexpected error loading users.'
      );
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [isEnabled]);

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
      setLoading(false);
      setError(null);
      return;
    }
    void refresh();
  }, [isEnabled, refresh]);

  return {
    users,
    loading,
    error,
    refresh,
    updateUser,
  };
};
