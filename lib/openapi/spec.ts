export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Finance Manager API',
    version: '1.0.0',
    description:
      'REST API for Better Auth + Prisma technical test. Includes auth/session helpers, movement tracking, user admin, and reporting endpoints.',
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Local development',
    },
  ],
  tags: [
    { name: 'Auth', description: 'Authentication helpers' },
    { name: 'Movements', description: 'Income/expense management' },
    { name: 'Users', description: 'Admin user management' },
    { name: 'Reports', description: 'Finance reporting endpoints' },
  ],
  components: {
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Unauthorized' },
        },
        required: ['error'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_123' },
          name: {
            type: 'string',
            nullable: true,
            example: 'Ada Lovelace',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'ada@example.com',
          },
          phone: {
            type: 'string',
            nullable: true,
            example: '+57 300 000 0000',
          },
          role: { type: 'string', enum: ['ADMIN', 'USER'], example: 'ADMIN' },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-15T12:34:56.000Z',
          },
        },
        required: ['id', 'email', 'role', 'createdAt'],
      },
      MeUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_123' },
          name: {
            type: 'string',
            nullable: true,
            example: 'Ada Lovelace',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'ada@example.com',
          },
          role: { type: 'string', enum: ['ADMIN', 'USER'], example: 'ADMIN' },
          phone: {
            type: 'string',
            nullable: true,
            example: '+57 300 000 0000',
          },
        },
        required: ['id', 'email', 'role'],
      },
      MeResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/MeUser' },
        },
        required: ['user'],
      },
      MovementUser: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_123' },
          name: { type: 'string', nullable: true, example: 'Grace Hopper' },
          email: {
            type: 'string',
            format: 'email',
            example: 'grace@example.com',
          },
        },
        required: ['id', 'email'],
      },
      Movement: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'mov_abc123' },
          type: {
            type: 'string',
            enum: ['INCOME', 'EXPENSE'],
            example: 'INCOME',
          },
          amount: { type: 'string', example: '1200.50' },
          concept: { type: 'string', example: 'Consulting services' },
          date: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T00:00:00.000Z',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2026-01-17T05:00:00.000Z',
          },
          user: { $ref: '#/components/schemas/MovementUser' },
        },
        required: [
          'id',
          'type',
          'amount',
          'concept',
          'date',
          'createdAt',
          'user',
        ],
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          page: {
            type: 'integer',
            minimum: 1,
            example: 1,
            description: 'Current page number (defaults to 1).',
          },
          limit: {
            type: 'integer',
            minimum: 1,
            maximum: 100,
            example: 20,
            description: 'Page size (defaults to 20, max 100).',
          },
          total: {
            type: 'integer',
            example: 42,
            description: 'Total amount of items for the query.',
          },
          totalPages: {
            type: 'integer',
            example: 3,
            description: 'Total pages derived from total/limit.',
          },
        },
        required: ['page', 'limit', 'total', 'totalPages'],
      },
      MovementsListResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/Movement' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
        required: ['data', 'meta'],
        example: {
          data: [
            {
              id: 'mov_abc123',
              type: 'INCOME',
              amount: '1200.50',
              concept: 'Consulting services',
              date: '2026-01-17T00:00:00.000Z',
              createdAt: '2026-01-17T05:00:00.000Z',
              user: {
                id: 'usr_123',
                name: 'Grace Hopper',
                email: 'grace@example.com',
              },
            },
          ],
          meta: {
            page: 1,
            limit: 20,
            total: 42,
            totalPages: 3,
          },
        },
      },
      MovementCreateBody: {
        type: 'object',
        properties: {
          type: { type: 'string', enum: ['INCOME', 'EXPENSE'] },
          amount: {
            description:
              'String or number greater than 0 (decimal precision supported)',
            oneOf: [{ type: 'string' }, { type: 'number' }],
          },
          concept: { type: 'string' },
          date: {
            type: 'string',
            format: 'date-time',
            description: 'ISO date for the movement',
          },
        },
        required: ['type', 'amount', 'concept', 'date'],
        example: {
          type: 'INCOME',
          amount: '2500.00',
          concept: 'SaaS subscription',
          date: '2026-01-20T00:00:00.000Z',
        },
      },
      UserUpdateBody: {
        type: 'object',
        description:
          'At least one field is required. Fields omitted will not be modified.',
        properties: {
          name: { type: 'string', example: 'Updated Name' },
          role: { type: 'string', enum: ['ADMIN', 'USER'], example: 'USER' },
          phone: {
            type: 'string',
            nullable: true,
            example: '+57 300 000 0000',
          },
        },
      },
      UsersListResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/User' },
          },
          meta: { $ref: '#/components/schemas/PaginationMeta' },
        },
        required: ['data', 'meta'],
        example: {
          data: [
            {
              id: 'usr_123',
              name: 'Ada Lovelace',
              email: 'ada@example.com',
              phone: '+57 300 000 0000',
              role: 'ADMIN',
              createdAt: '2026-01-15T12:34:56.000Z',
            },
          ],
          meta: {
            page: 1,
            limit: 20,
            total: 5,
            totalPages: 1,
          },
        },
      },
      ReportPoint: {
        type: 'object',
        properties: {
          period: { type: 'string', example: '2026-01-17' },
          income: { type: 'string', example: '1200.00' },
          expense: { type: 'string', example: '450.00' },
          net: { type: 'string', example: '750.00' },
        },
        required: ['period', 'income', 'expense', 'net'],
      },
      ReportsSummaryResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              totalIncome: { type: 'string', example: '15200.00' },
              totalExpense: { type: 'string', example: '3200.50' },
              balance: { type: 'string', example: '12000.50' },
              group: { type: 'string', enum: ['day', 'month'], example: 'day' },
              range: {
                type: 'object',
                properties: {
                  from: {
                    type: 'string',
                    format: 'date-time',
                    example: '2026-01-01T00:00:00.000Z',
                  },
                  to: {
                    type: 'string',
                    format: 'date-time',
                    example: '2026-01-30T23:59:59.999Z',
                  },
                },
                required: ['from', 'to'],
              },
              points: {
                type: 'array',
                items: { $ref: '#/components/schemas/ReportPoint' },
              },
            },
            required: [
              'totalIncome',
              'totalExpense',
              'balance',
              'group',
              'range',
              'points',
            ],
          },
        },
        required: ['data'],
      },
    },
  },
  paths: {
    '/api/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current authenticated user',
        responses: {
          200: {
            description: 'Current session found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MeResponse' },
                example: {
                  user: {
                    id: 'usr_123',
                    name: 'Ada Lovelace',
                    email: 'ada@example.com',
                    role: 'ADMIN',
                    phone: '+57 300 000 0000',
                  },
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Unauthorized' },
              },
            },
          },
          405: {
            description: 'Method Not Allowed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Method Not Allowed' },
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Internal Server Error' },
              },
            },
          },
        },
      },
    },
    '/api/movements': {
      get: {
        tags: ['Movements'],
        summary: 'List movements for the authenticated user',
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
            description: 'Page number to retrieve (defaults to 1).',
          },
          {
            in: 'query',
            name: 'limit',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
            description: 'Page size (defaults to 20, maximum 100).',
          },
          {
            in: 'query',
            name: 'search',
            schema: {
              type: 'string',
            },
            description:
              'Optional filter that matches concept text or movement type.',
            example: 'consulting',
          },
        ],
        responses: {
          200: {
            description: 'List of movements',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MovementsListResponse' },
                examples: {
                  default: {
                    summary: 'First page without filters',
                    value: {
                      data: [
                        {
                          id: 'mov_abc123',
                          type: 'INCOME',
                          amount: '1200.50',
                          concept: 'Consulting services',
                          date: '2026-01-17T00:00:00.000Z',
                          createdAt: '2026-01-17T05:00:00.000Z',
                          user: {
                            id: 'usr_123',
                            name: 'Grace Hopper',
                            email: 'grace@example.com',
                          },
                        },
                      ],
                      meta: {
                        page: 1,
                        limit: 20,
                        total: 42,
                        totalPages: 3,
                      },
                    },
                  },
                  search: {
                    summary: 'Page 2 filtered by concept search',
                    value: {
                      data: [
                        {
                          id: 'mov_xyz999',
                          type: 'EXPENSE',
                          amount: '450.00',
                          concept: 'Consulting travel',
                          date: '2026-02-05T00:00:00.000Z',
                          createdAt: '2026-02-05T03:00:00.000Z',
                          user: {
                            id: 'usr_789',
                            name: 'Linus',
                            email: 'linus@example.com',
                          },
                        },
                      ],
                      meta: {
                        page: 2,
                        limit: 10,
                        total: 12,
                        totalPages: 2,
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid pagination params',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  error: '"limit" cannot be greater than 100.',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Unauthorized' },
              },
            },
          },
          405: {
            description: 'Method Not Allowed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Method Not Allowed' },
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Internal Server Error' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Movements'],
        summary: 'Create a movement (admin only)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MovementCreateBody' },
            },
          },
        },
        responses: {
          201: {
            description: 'Movement created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/Movement' },
                  },
                  required: ['data'],
                },
              },
            },
          },
          400: {
            description: 'Validation error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Validation error' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Unauthorized' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Forbidden' },
              },
            },
          },
          405: {
            description: 'Method Not Allowed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Method Not Allowed' },
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Internal Server Error' },
              },
            },
          },
        },
      },
    },
    '/api/users': {
      get: {
        tags: ['Users'],
        summary: 'List users (admin only)',
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: {
              type: 'integer',
              minimum: 1,
              default: 1,
            },
            description: 'Page number to retrieve (defaults to 1).',
          },
          {
            in: 'query',
            name: 'limit',
            schema: {
              type: 'integer',
              minimum: 1,
              maximum: 100,
              default: 20,
            },
            description: 'Page size (defaults to 20, maximum 100).',
          },
          {
            in: 'query',
            name: 'search',
            schema: {
              type: 'string',
            },
            description:
              'Optional filter that matches user name or email (case-insensitive).',
            example: 'ada@example.com',
          },
        ],
        responses: {
          200: {
            description: 'User list',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UsersListResponse' },
                examples: {
                  default: {
                    summary: 'First page without filters',
                    value: {
                      data: [
                        {
                          id: 'usr_123',
                          name: 'Ada Lovelace',
                          email: 'ada@example.com',
                          phone: '+57 300 000 0000',
                          role: 'ADMIN',
                          createdAt: '2026-01-15T12:34:56.000Z',
                        },
                      ],
                      meta: {
                        page: 1,
                        limit: 20,
                        total: 5,
                        totalPages: 1,
                      },
                    },
                  },
                  search: {
                    summary: 'Filtered by email search (page 2)',
                    value: {
                      data: [
                        {
                          id: 'usr_456',
                          name: 'Grace Hopper',
                          email: 'grace@example.com',
                          phone: null,
                          role: 'USER',
                          createdAt: '2026-02-10T09:15:00.000Z',
                        },
                      ],
                      meta: {
                        page: 2,
                        limit: 10,
                        total: 18,
                        totalPages: 2,
                      },
                    },
                  },
                },
              },
            },
          },
          400: {
            description: 'Invalid pagination params',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: {
                  error:
                    '"page" must be an integer greater than or equal to 1.',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Unauthorized' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Forbidden' },
              },
            },
          },
          405: {
            description: 'Method Not Allowed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Method Not Allowed' },
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Internal Server Error' },
              },
            },
          },
        },
      },
    },
    '/api/users/{id}': {
      patch: {
        tags: ['Users'],
        summary: 'Update user fields (admin only)',
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string' },
            description: 'User ID',
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UserUpdateBody' },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: { $ref: '#/components/schemas/User' },
                  },
                  required: ['data'],
                },
              },
            },
          },
          400: {
            description: 'Validation error or empty payload',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Validation error' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Unauthorized' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Forbidden' },
              },
            },
          },
          404: {
            description: 'User not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'User not found' },
              },
            },
          },
          405: {
            description: 'Method Not Allowed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Method Not Allowed' },
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Internal Server Error' },
              },
            },
          },
        },
      },
    },
    '/api/reports/summary': {
      get: {
        tags: ['Reports'],
        summary: 'Summary of movements for charts (admin only)',
        parameters: [
          {
            in: 'query',
            name: 'group',
            schema: { type: 'string', enum: ['day', 'month'] },
            description: 'Grouping bucket. Defaults to day.',
          },
          {
            in: 'query',
            name: 'from',
            schema: { type: 'string', format: 'date' },
            description: 'Start date (YYYY-MM-DD)',
          },
          {
            in: 'query',
            name: 'to',
            schema: { type: 'string', format: 'date' },
            description: 'End date (YYYY-MM-DD)',
          },
        ],
        responses: {
          200: {
            description: 'Summary data',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ReportsSummaryResponse' },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Unauthorized' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Forbidden' },
              },
            },
          },
          400: {
            description: 'Invalid query params',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Invalid date range' },
              },
            },
          },
          405: {
            description: 'Method Not Allowed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Method Not Allowed' },
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Internal Server Error' },
              },
            },
          },
        },
      },
    },
    '/api/reports/csv': {
      get: {
        tags: ['Reports'],
        summary: 'Download CSV export (admin only)',
        parameters: [
          {
            in: 'query',
            name: 'from',
            schema: { type: 'string', format: 'date' },
            description: 'Optional start date (YYYY-MM-DD)',
          },
          {
            in: 'query',
            name: 'to',
            schema: { type: 'string', format: 'date' },
            description: 'Optional end date (YYYY-MM-DD)',
          },
        ],
        responses: {
          200: {
            description: 'CSV attachment',
            content: {
              'text/csv': {
                schema: {
                  type: 'string',
                  example: 'type,amount,concept,date,userName,userEmail',
                },
              },
            },
            headers: {
              'Content-Disposition': {
                description: 'Indicates download filename.',
                schema: {
                  type: 'string',
                  example: 'attachment; filename="report.csv"',
                },
              },
            },
          },
          401: {
            description: 'Unauthorized',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Unauthorized' },
              },
            },
          },
          403: {
            description: 'Forbidden',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Forbidden' },
              },
            },
          },
          400: {
            description: 'Invalid date range',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Invalid date range' },
              },
            },
          },
          405: {
            description: 'Method Not Allowed',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Method Not Allowed' },
              },
            },
          },
          500: {
            description: 'Internal Server Error',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' },
                example: { error: 'Internal Server Error' },
              },
            },
          },
        },
      },
    },
  },
} as const;

export type OpenApiSpec = typeof openApiSpec;
