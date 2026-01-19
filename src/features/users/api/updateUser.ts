import type { Role, UserRow } from '@/lib/users/types';

interface UpdatePayload {
  name?: string;
  role?: Role;
  phone?: string | null;
}

interface UpdateResponse {
  data: UserRow;
  error?: string;
}

export const updateUserRequest = async (
  id: string,
  body: UpdatePayload
): Promise<UserRow> => {
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

  const payload = (await response.json()) as UpdateResponse;

  if (!response.ok) {
    throw new Error(payload.error ?? 'Unable to update user.');
  }

  return payload.data;
};
