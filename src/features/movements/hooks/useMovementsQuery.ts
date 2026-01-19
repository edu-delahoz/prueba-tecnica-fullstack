import { useCallback, useEffect, useState } from 'react';

export type MovementRole = 'INCOME' | 'EXPENSE';

export type MovementRow = {
  id: string;
  type: MovementRole;
  amount: string;
  concept: string;
  date: string;
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
};

export type MovementsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const buildDefaultMeta = (limit: number): MovementsMeta => ({
  page: 1,
  limit,
  total: 0,
  totalPages: 1,
});

interface UseMovementsQueryParams {
  page: number;
  limit: number;
  enabled: boolean;
}

export const useMovementsQuery = ({
  page,
  limit,
  enabled,
}: UseMovementsQueryParams) => {
  const [data, setData] = useState<MovementRow[]>([]);
  const [meta, setMeta] = useState<MovementsMeta>(buildDefaultMeta(limit));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMovements = useCallback(async () => {
    if (!enabled) {
      setData([]);
      setMeta(buildDefaultMeta(limit));
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
      const response = await fetch(`/api/movements?${search.toString()}`);
      if (response.status === 401) {
        setData([]);
        setMeta(buildDefaultMeta(limit));
        setError('Please sign in to view movements.');
        return;
      }
      if (!response.ok) {
        throw new Error('Unable to load movements.');
      }
      const payload = (await response.json()) as {
        data: MovementRow[];
        meta?: MovementsMeta;
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
      setMeta(buildDefaultMeta(limit));
      setError(
        caught instanceof Error
          ? caught.message
          : 'Unexpected error loading movements.'
      );
    } finally {
      setLoading(false);
    }
  }, [enabled, limit, page]);

  useEffect(() => {
    void fetchMovements();
  }, [fetchMovements]);

  useEffect(() => {
    setMeta((previous) => ({
      ...previous,
      limit,
    }));
  }, [limit]);

  return {
    data,
    meta,
    loading,
    error,
    refresh: fetchMovements,
  };
};
