import { describe, it, expect } from 'vitest';

import { movementCreateSchema } from '@/lib/validation/movements';

const basePayload = {
  type: 'INCOME',
  amount: '100.00',
  concept: 'Consulting',
  date: '2026-01-01T00:00:00.000Z',
};

describe('movementCreateSchema', () => {
  it('accepts a valid payload', () => {
    const result = movementCreateSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.concept).toBe('Consulting');
    }
  });

  it('rejects amount "0"', () => {
    const result = movementCreateSchema.safeParse({
      ...basePayload,
      amount: '0',
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = movementCreateSchema.safeParse({
      ...basePayload,
      amount: '-1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-numeric amount', () => {
    const result = movementCreateSchema.safeParse({
      ...basePayload,
      amount: 'abc',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty amount string', () => {
    const result = movementCreateSchema.safeParse({
      ...basePayload,
      amount: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date string', () => {
    const result = movementCreateSchema.safeParse({
      ...basePayload,
      date: 'asdf',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing required fields', () => {
    const result = movementCreateSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

