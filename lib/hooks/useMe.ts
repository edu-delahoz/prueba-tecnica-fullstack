import useSWR from 'swr';

type Role = 'USER' | 'ADMIN';

export interface MeUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  phone?: string | null;
}

const fetcher = async (): Promise<MeUser | null> => {
  const response = await fetch('/api/me', {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Unable to retrieve profile');
  }

  const data = (await response.json()) as { user: MeUser };
  return data.user;
};

export const useMe = () => {
  const { data, error, isLoading, mutate } = useSWR<MeUser | null>(
    '/api/me',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 30_000,
      keepPreviousData: true,
    }
  );

  const loading = isLoading && data === undefined;

  return {
    user: data ?? null,
    loading,
    error: error ? error.message : null,
    refresh: () => mutate(),
  };
};
