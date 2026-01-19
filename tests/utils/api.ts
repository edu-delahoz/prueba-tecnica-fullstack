import type { NextApiRequest, NextApiResponse } from 'next';

interface MockOptions {
  method?: string;
  query?: Record<string, string | string[]>;
  body?: unknown;
}

interface MockResponse<T = unknown> extends NextApiResponse<T> {
  statusCode: number;
  body?: T;
}

export const createMockReqRes = <T = unknown>({
  method = 'GET',
  query = {},
  body = undefined,
}: MockOptions = {}) => {
  const req = {
    method,
    query,
    body,
    headers: {},
  } as unknown as NextApiRequest;

  const res = {
    statusCode: 200,
    body: undefined as T | undefined,
    headers: {} as Record<string, string | number | readonly string[]>,
    setHeader(name: string, value: string | number | readonly string[]) {
      this.headers[name] = value;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: T) {
      this.body = payload;
      return this;
    },
  } as unknown as MockResponse<T>;

  return {
    req,
    res,
    getStatus: () => res.statusCode,
    getJSON: () => res.body,
    headers: res.headers,
  };
};
