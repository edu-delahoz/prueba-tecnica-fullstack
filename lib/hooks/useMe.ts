import { useCallback, useEffect, useState } from 'react';

type Role = 'USER' | 'ADMIN';

export interface MeUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  phone?: string | null;
}

export const useMe = () => {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/me', { credentials: 'include' });

      if (response.status === 401) {
        setUser(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Unable to retrieve profile');
      }

      const data = (await response.json()) as { user: MeUser };
      setUser(data.user);
    } catch (err) {
      setUser(null);
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchMe();
  }, [fetchMe]);

  return { user, loading, error, refresh: fetchMe };
};
