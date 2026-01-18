import { useCallback, useEffect, useMemo, useState } from 'react';
import type { NextPage } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Download, ShieldOff } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { TopNav } from '@/components/layout/TopNav';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { authClient } from '@/lib/auth/client';
import { useMe } from '@/lib/hooks/useMe';

type ReportPoint = {
  period: string;
  income: string;
  expense: string;
  net: string;
};

type SummaryPayload = {
  totalIncome: string;
  totalExpense: string;
  balance: string;
  points: ReportPoint[];
  range?: {
    from: string;
    to: string;
  };
};

type SummaryResponse = {
  data: SummaryPayload;
};

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const formatCurrency = (value: string) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return value;
  }
  return currencyFormatter.format(parsed);
};

const parseNumeric = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const ReportsPage: NextPage = () => {
  const { user, loading: meLoading, refresh: refreshMe } = useMe();
  const [summary, setSummary] = useState<SummaryPayload | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const isAdmin = user?.role === 'ADMIN';

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const response = await fetch('/api/reports/summary');
      const payload = (await response.json()) as SummaryResponse & {
        error?: string;
      };
      if (!response.ok) {
        throw new Error(payload.error ?? 'Unable to load summary.');
      }
      setSummary(payload.data);
    } catch (error) {
      setSummary(null);
      setSummaryError(
        error instanceof Error
          ? error.message
          : 'Unexpected error loading summary.'
      );
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin || meLoading) {
      return;
    }
    void fetchSummary();
  }, [isAdmin, meLoading, fetchSummary]);

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
  }, [refreshMe]);

  const chartData = useMemo(
    () =>
      summary?.points.map((point) => ({
        period: point.period,
        income: parseNumeric(point.income),
        expense: parseNumeric(point.expense),
        net: parseNumeric(point.net),
      })) ?? [],
    [summary]
  );

  const rangeLabel = useMemo(() => {
    if (!summary?.range) {
      return 'Last 30 days';
    }
    const from = new Date(summary.range.from);
    const to = new Date(summary.range.to);
    const fromLabel = from.toLocaleDateString();
    const toLabel = to.toLocaleDateString();
    return `${fromLabel} – ${toLabel}`;
  }, [summary]);

  let content: React.ReactNode = null;

  if (meLoading) {
    content = (
      <Card className='bg-white'>
        <CardContent className='py-6 text-sm text-muted-foreground'>
          Loading session...
        </CardContent>
      </Card>
    );
  } else if (!user) {
    content = (
      <Card className='bg-white'>
        <CardHeader>
          <CardTitle>Please sign in</CardTitle>
          <CardDescription>
            Sign in with GitHub to view financial reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleSignIn}>Sign in with GitHub</Button>
        </CardContent>
      </Card>
    );
  } else if (!isAdmin) {
    content = (
      <Card className='bg-white'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2 text-destructive'>
            <ShieldOff className='h-4 w-4' />
            Restricted area
          </CardTitle>
          <CardDescription>
            Only administrators can access financial reports.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  } else if (summaryLoading) {
    content = (
      <Card className='bg-white'>
        <CardContent className='py-6 text-sm text-muted-foreground'>
          Loading summary...
        </CardContent>
      </Card>
    );
  } else if (summaryError) {
    content = (
      <Card className='bg-white'>
        <CardHeader>
          <CardTitle className='text-destructive'>
            Unable to load report
          </CardTitle>
          <CardDescription>{summaryError}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant='outline' onClick={fetchSummary}>
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  } else if (!summary) {
    content = (
      <Card className='bg-white'>
        <CardContent className='py-6 text-sm text-muted-foreground'>
          No data available for the selected range.
        </CardContent>
      </Card>
    );
  } else {
    content = (
      <div className='space-y-8'>
        <section className='grid gap-4 md:grid-cols-3'>
          <Card className='bg-gradient-to-br from-slate-900 to-slate-700 text-white'>
            <CardHeader>
              <CardDescription className='text-slate-200'>
                Current balance
              </CardDescription>
              <CardTitle className='text-4xl font-semibold'>
                {formatCurrency(summary.balance)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-sm text-slate-200'>Period: {rangeLabel}</p>
            </CardContent>
          </Card>
          <Card className='bg-white'>
            <CardHeader>
              <CardDescription>Total income</CardDescription>
              <CardTitle className='text-3xl font-semibold text-emerald-600'>
                {formatCurrency(summary.totalIncome)}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className='bg-white'>
            <CardHeader>
              <CardDescription>Total expense</CardDescription>
              <CardTitle className='text-3xl font-semibold text-red-500'>
                {formatCurrency(summary.totalExpense)}
              </CardTitle>
            </CardHeader>
          </Card>
        </section>

        <Card className='bg-white'>
          <CardHeader className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
            <div>
              <CardTitle>Performance overview</CardTitle>
              <CardDescription>
                Income, expenses, and net balance grouped by period.
              </CardDescription>
            </div>
            <Button asChild variant='outline' className='gap-2'>
              <Link
                href='/api/reports/csv'
                target='_blank'
                rel='noreferrer'
                prefetch={false}
              >
                <Download className='h-4 w-4' />
                Download CSV
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <div className='h-[360px] w-full'>
                <ResponsiveContainer width='100%' height='100%'>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray='4 4' stroke='#e2e8f0' />
                    <XAxis
                      dataKey='period'
                      tick={{ fontSize: 12 }}
                      stroke='#94a3b8'
                      tickLine={false}
                    />
                    <YAxis
                      stroke='#94a3b8'
                      tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                      formatter={(value: number | undefined) =>
                        currencyFormatter.format(value ?? 0)
                      }
                      labelFormatter={(value) => `Period: ${value}`}
                    />
                    <Legend />
                    <Area
                      type='monotone'
                      dataKey='income'
                      stroke='#10b981'
                      fill='#d1fae5'
                      strokeWidth={2}
                      name='Income'
                    />
                    <Area
                      type='monotone'
                      dataKey='expense'
                      stroke='#ef4444'
                      fill='#fee2e2'
                      strokeWidth={2}
                      name='Expense'
                    />
                    <Area
                      type='monotone'
                      dataKey='net'
                      stroke='#6366f1'
                      fill='#e0e7ff'
                      strokeWidth={2}
                      name='Net'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className='flex h-48 items-center justify-center text-sm text-muted-foreground'>
                No movements available for charting yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Reports | Finance Manager</title>
      </Head>
      <div className='min-h-screen bg-slate-50'>
        <TopNav
          user={user}
          loading={meLoading}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
        />
        <main className='mx-auto max-w-6xl px-6 py-10'>
          <div className='mb-6'>
            <Button asChild variant='ghost' className='gap-2 rounded-full px-4'>
              <Link href='/'>
                <ArrowLeft className='h-4 w-4' />
                Back to dashboard
              </Link>
            </Button>
          </div>

          <div className='mb-8 space-y-2'>
            <p className='text-sm uppercase tracking-[0.25em] text-muted-foreground'>
              Reports
            </p>
            <h1 className='text-3xl font-semibold text-foreground'>
              Financial summary
            </h1>
            <p className='text-sm text-muted-foreground'>
              Track revenue, spending, and balance for the latest period.
            </p>
          </div>

          {content}
        </main>
      </div>
    </>
  );
};

export default ReportsPage;
