import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  DollarSign,
  RefreshCw,
  ShieldOff,
} from 'lucide-react';

import { TopNav } from '@/components/layout/TopNav';
import { TablePagination } from '@/components/table/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { authClient } from '@/lib/auth/client';
import { useMe } from '@/lib/hooks/useMe';

type MovementRole = 'INCOME' | 'EXPENSE';

type MovementRow = {
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

type MovementsMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const amountFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatAmount = (value: string) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return value;
  }
  return amountFormatter.format(numeric);
};

const formatDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    return value;
  }
  return parsed.toLocaleDateString();
};

const initialForm = {
  type: 'INCOME' as MovementRole,
  amount: '',
  concept: '',
  date: '',
};

// eslint-disable-next-line complexity
const MovementsPage: NextPage = () => {
  const {
    user,
    loading: userLoading,
    error: meError,
    refresh: refreshMe,
  } = useMe();
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const isAdmin = user?.role === 'ADMIN';
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState<MovementsMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const fetchMovements = useCallback(async () => {
    setListLoading(true);
    setListError(null);
    try {
      const search = new URLSearchParams({
        page: page.toString(),
        limit: pageSize.toString(),
      });
      const response = await fetch(`/api/movements?${search.toString()}`);
      if (response.status === 401) {
        setMovements([]);
        setListError('Please sign in to view movements.');
        setPaginationMeta({
          page: 1,
          limit: pageSize,
          total: 0,
          totalPages: 1,
        });
        setPage(1);
        return;
      }
      if (!response.ok) {
        throw new Error('Unable to load movements.');
      }
      const payload = (await response.json()) as {
        data: MovementRow[];
        meta?: MovementsMeta;
      };
      setMovements(payload.data);
      if (payload.meta) {
        setPaginationMeta(payload.meta);
      } else {
        setPaginationMeta({
          page,
          limit: pageSize,
          total: payload.data.length,
          totalPages:
            payload.data.length === 0
              ? 1
              : Math.ceil(payload.data.length / pageSize),
        });
      }
    } catch (error) {
      setListError(
        error instanceof Error
          ? error.message
          : 'Unexpected error loading movements.'
      );
    } finally {
      setListLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    if (userLoading) {
      return;
    }
    if (!user) {
      setListLoading(false);
      setMovements([]);
      setPaginationMeta({
        page: 1,
        limit: pageSize,
        total: 0,
        totalPages: 1,
      });
      setPage(1);
      if (!meError) {
        setListError('Please sign in to view movements.');
      }
      return;
    }
    fetchMovements();
  }, [user, userLoading, meError, fetchMovements, pageSize]);

  const resetForm = () => {
    setForm(initialForm);
    setFormError(null);
    setFormLoading(false);
  };

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  const handleInputChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateForm = () => {
    if (!form.concept.trim()) {
      return 'Concept is required.';
    }
    const amountNumber = Number(form.amount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return 'Amount must be a positive number.';
    }
    if (!form.date) {
      return 'Date is required.';
    }
    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationMessage = validateForm();
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }
    setFormLoading(true);
    setFormError(null);
    try {
      const isoDate = new Date(`${form.date}T00:00:00.000Z`).toISOString();
      const response = await fetch('/api/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: form.type,
          amount: Number(form.amount),
          concept: form.concept.trim(),
          date: isoDate,
        }),
      });
      if (response.status === 401) {
        throw new Error('You need to sign in again.');
      }
      if (response.status === 403) {
        throw new Error('Only admins can create movements.');
      }
      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? 'Unable to create movement.');
      }
      setBanner({ type: 'success', message: 'Movement created successfully.' });
      handleDialogChange(false);
      await fetchMovements();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Unexpected error.'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const showRetry = Boolean(listError) && Boolean(user);

  const headerDescription = useMemo(() => {
    if (!user && !userLoading) {
      return 'Sign in to review and create team movements.';
    }
    return 'Monitor cashflow and create new entries when needed.';
  }, [user, userLoading]);

  const handleSignIn = useCallback(async () => {
    if (typeof window === 'undefined') {
      return;
    }
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: `${window.location.origin}/`,
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    await refreshMe();
    await fetchMovements();
  }, [fetchMovements, refreshMe]);

  const totalRecords = paginationMeta.total;
  const hasMovements = totalRecords > 0;

  let movementSection: React.ReactNode;
  if (listLoading) {
    movementSection = (
      <Card>
        <CardContent className='flex items-center gap-3 py-10 text-muted-foreground'>
          <RefreshCw className='h-4 w-4 animate-spin' />
          Loading movements...
        </CardContent>
      </Card>
    );
  } else if (listError) {
    movementSection = (
      <Card className='border border-destructive/30 bg-destructive/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <ShieldOff className='h-4 w-4' />
            {listError}
          </CardTitle>
          <CardDescription>
            {user
              ? 'Please try again. If the issue persists contact support.'
              : 'Sign in to access this section.'}
          </CardDescription>
        </CardHeader>
        {showRetry && (
          <CardContent>
            <Button variant='outline' onClick={fetchMovements}>
              Retry
            </Button>
          </CardContent>
        )}
      </Card>
    );
  } else if (!hasMovements) {
    movementSection = (
      <Card>
        <CardHeader>
          <CardTitle>No movements yet</CardTitle>
          <CardDescription>
            {isAdmin
              ? 'Create your first income or expense to populate the table.'
              : 'Movements will appear here once admins add them.'}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  } else {
    movementSection = (
      <Card>
        <CardHeader className='flex flex-row items-center justify-between space-y-0'>
          <div>
            <CardTitle>Latest movements</CardTitle>
            <CardDescription>Showing {totalRecords} records</CardDescription>
          </div>
          <Badge variant='secondary' className='text-xs'>
            Updated {new Date().toLocaleDateString()}
          </Badge>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Concept</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movements.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className='py-8 text-center text-sm text-muted-foreground'
                  >
                    No movements available.
                  </TableCell>
                </TableRow>
              ) : (
                movements.map((movement) => (
                  <TableRow key={movement.id}>
                    <TableCell className='font-medium'>
                      {movement.concept}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-2 font-semibold ${
                          movement.type === 'INCOME'
                            ? 'text-emerald-600'
                            : 'text-rose-600'
                        }`}
                      >
                        <DollarSign className='h-4 w-4' />
                        {formatAmount(movement.amount)}
                      </span>
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      <span className='inline-flex items-center gap-2'>
                        <CalendarDays className='h-4 w-4' />
                        {formatDate(movement.date)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {movement.user.name ?? movement.user.email}
                      <p className='text-xs text-muted-foreground'>
                        {movement.user.email}
                      </p>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {hasMovements && (
            <TablePagination
              page={page}
              totalPages={paginationMeta.totalPages}
              onPrev={() => setPage((current) => Math.max(current - 1, 1))}
              onNext={() =>
                setPage((current) =>
                  Math.min(current + 1, Math.max(paginationMeta.totalPages, 1))
                )
              }
              pageSize={pageSize}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setPage(1);
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Head>
        <title>Movements | Finance Manager</title>
      </Head>
      <div className='min-h-screen bg-background'>
        <TopNav
          user={user}
          loading={userLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
        <main className='mx-auto max-w-6xl px-6 py-10'>
          <div className='mb-4'>
            <Button asChild variant='ghost' className='gap-2 rounded-full px-4'>
              <Link href='/'>
                <ArrowLeft className='h-4 w-4' />
                Back to dashboard
              </Link>
            </Button>
          </div>

          {!user && !userLoading && (
            <Card className='mb-6 border-dashed'>
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>
                  Sign in with GitHub to view and create new movements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={handleSignIn}>Sign in with GitHub</Button>
              </CardContent>
            </Card>
          )}

          <div className='mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div>
              <p className='text-sm uppercase tracking-[0.25em] text-muted-foreground'>
                Movements
              </p>
              <h1 className='text-3xl font-semibold text-foreground'>
                Cashflow overview
              </h1>
              <p className='text-sm text-muted-foreground'>
                {headerDescription}
              </p>
            </div>
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
                <DialogTrigger asChild>
                  <Button className='rounded-full px-6'>New movement</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create movement</DialogTitle>
                    <DialogDescription>
                      Register an income or expense for the team.
                    </DialogDescription>
                  </DialogHeader>
                  <form className='mt-6 space-y-4' onSubmit={handleSubmit}>
                    <div className='space-y-2'>
                      <Label htmlFor='type'>Type</Label>
                      <Select
                        value={form.type}
                        onValueChange={(value) =>
                          handleInputChange('type', value as MovementRole)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder='Select type' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='INCOME'>Income</SelectItem>
                          <SelectItem value='EXPENSE'>Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='amount'>Amount</Label>
                      <Input
                        id='amount'
                        type='number'
                        min='0'
                        placeholder='0.00'
                        value={form.amount}
                        onChange={(event) =>
                          handleInputChange('amount', event.target.value)
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='concept'>Concept</Label>
                      <Input
                        id='concept'
                        type='text'
                        placeholder='Description'
                        value={form.concept}
                        onChange={(event) =>
                          handleInputChange('concept', event.target.value)
                        }
                      />
                    </div>
                    <div className='space-y-2'>
                      <Label htmlFor='date'>Date</Label>
                      <Input
                        id='date'
                        type='date'
                        value={form.date}
                        onChange={(event) =>
                          handleInputChange('date', event.target.value)
                        }
                      />
                    </div>
                    {formError && (
                      <p className='text-sm text-destructive'>{formError}</p>
                    )}
                    <Button
                      className='w-full'
                      type='submit'
                      disabled={formLoading}
                    >
                      {formLoading ? 'Saving…' : 'Create movement'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {banner && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${
                banner.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-destructive/40 bg-destructive/10 text-destructive'
              }`}
            >
              {banner.message}
            </div>
          )}

          {movementSection}

          <Card className='mt-10'>
            <CardHeader>
              <CardTitle>Need more insights?</CardTitle>
              <CardDescription>
                Reports summarize incomes vs expenses so you can share updates
                with stakeholders.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                asChild
                variant='secondary'
                className='group rounded-full'
              >
                <Link href='/reports'>
                  Go to reports
                  <ArrowRight className='ml-2 h-4 w-4 transition group-hover:translate-x-1' />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </>
  );
};

export default MovementsPage;
