import { useCallback, useEffect, useRef, useState } from 'react';

type Role = 'USER' | 'ADMIN';

export interface MeUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  phone?: string | null;
}

interface UseMeResult {
  user: MeUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useMe = (): UseMeResult => {
  const [user, setUser] = useState<MeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(
    () => () => {
      mountedRef.current = false;
    },
    []
  );

  const fetchMe = useCallback(async () => {
    if (mountedRef.current) {
      setLoading(true);
    }
    try {
      const response = await fetch('/api/me');
      if (!mountedRef.current) {
        return;
      }
      if (response.status === 401) {
        setUser(null);
        setError(null);
        return;
      }
      if (!response.ok) {
        throw new Error('Unable to retrieve profile');
      }
      const data = (await response.json()) as { user: MeUser };
      setUser(data.user);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) {
        return;
      }
      setUser(null);
      setError(err instanceof Error ? err.message : 'Unexpected error');
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  return {
    user,
    loading,
    error,
    refresh: fetchMe,
  };
};
