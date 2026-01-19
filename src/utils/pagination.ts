import type { NextApiRequest } from 'next';

export interface PaginationParams {
  page: number;
  limit: number;
}

export const parsePaginationParams = (
  query: NextApiRequest['query'],
  {
    defaultPage = 1,
    defaultLimit = 20,
    maxLimit = 100,
  }: { defaultPage?: number; defaultLimit?: number; maxLimit?: number } = {}
): PaginationParams => {
  const toSingleValue = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value;

  const getNumericParam = (
    name: 'page' | 'limit',
    config: { defaultValue: number; min: number; max?: number }
  ) => {
    const single = toSingleValue(query[name]);
    if (!single) {
      return config.defaultValue;
    }

    const parsed = Number(single);
    if (!Number.isInteger(parsed) || parsed < config.min) {
      throw new Error(
        `"${name}" must be an integer greater than or equal to ${config.min}.`
      );
    }

    if (config.max && parsed > config.max) {
      throw new Error(`"${name}" cannot be greater than ${config.max}.`);
    }

    return parsed;
  };

  const page = getNumericParam('page', { defaultValue: defaultPage, min: 1 });
  const limit = getNumericParam('limit', {
    defaultValue: defaultLimit,
    min: 1,
    max: maxLimit,
  });

  return { page, limit };
};

export const parseSearchParam = (
  query: NextApiRequest['query'],
  name = 'search'
): string | undefined => {
  const raw = query[name];
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
