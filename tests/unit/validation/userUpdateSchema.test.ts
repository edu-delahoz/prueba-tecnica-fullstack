import { describe, it, expect } from 'vitest';

import { userUpdateSchema } from '@/lib/validation/users';

describe('userUpdateSchema', () => {
  it('fails when no fields are provided', () => {
    const result = userUpdateSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('passes when name is provided', () => {
    const result = userUpdateSchema.safeParse({ name: 'Alice' });
    expect(result.success).toBe(true);
  });

  it('passes when role is USER', () => {
    const result = userUpdateSchema.safeParse({ role: 'USER' });
    expect(result.success).toBe(true);
  });

  it('fails on invalid role', () => {
    const result = userUpdateSchema.safeParse({ role: 'MANAGER' });
    expect(result.success).toBe(false);
  });

  it('fails when phone is null (since schema requires string)', () => {
    const result = userUpdateSchema.safeParse({ phone: null });
    expect(result.success).toBe(false);
  });
});

