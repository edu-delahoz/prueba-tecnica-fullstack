export type Role = 'ADMIN' | 'USER';

export interface UserRow {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: string;
}
