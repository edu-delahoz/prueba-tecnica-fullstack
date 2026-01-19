import { useCallback } from 'react';
import type { NextPage } from 'next';
import Link from 'next/link';
import { ArrowRight, BarChart3, Lock, Users, Wallet } from 'lucide-react';

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

const NAV_ITEMS = [
  {
    title: 'Movements',
    description:
      'Review the latest income and expenses registered by your team.',
    href: '/movements',
    icon: Wallet,
    adminOnly: false,
  },
  {
    title: 'Users',
    description:
      'Invite teammates, assign roles, and manage Better Auth accounts.',
    href: '/users',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Reports',
    description: 'Analyze KPIs with quick snapshots of cashflow trends.',
    href: '/reports',
    icon: BarChart3,
    adminOnly: true,
  },
];

const HomePage: NextPage = () => {
  const { user, loading, error, refresh } = useMe();

  const handleSignIn = useCallback(async () => {
    if (typeof window === 'undefined') return;
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: `${window.location.origin}/`,
    });
  }, []);

  const handleSignOut = useCallback(async () => {
    await authClient.signOut();
    await refresh();
  }, [refresh]);

  return (
    <div className='min-h-screen bg-background'>
      <TopNav
        user={user}
        loading={loading}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />
      <main className='mx-auto max-w-6xl px-6 py-10'>
        {!user && !loading && (
          <Card className='mb-8 border-dashed'>
            <CardHeader>
              <CardTitle>Welcome! Please sign in</CardTitle>
              <CardDescription>
                Connect with GitHub to view admin features like Users and
                Reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSignIn}>Sign in with GitHub</Button>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className='mb-6 rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive'>
            {error}
          </div>
        )}

        <div className='mb-6 flex items-center justify-between'>
          <div>
            <p className='text-sm uppercase tracking-[0.2em] text-muted-foreground'>
              Dashboard
            </p>
            <h1 className='text-3xl font-semibold text-foreground'>
              Quick navigation
            </h1>
          </div>
          {user && (
            <span className='text-sm text-muted-foreground'>
              Logged in as <span className='font-semibold'>{user.role}</span>
            </span>
          )}
        </div>

        <section className='grid gap-6 md:grid-cols-2'>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isAuthenticated = Boolean(user);
            const isAdmin = user?.role === 'ADMIN';
            const isAdminOnly = item.adminOnly;
            const locked = isAdminOnly && !isAdmin;
            const lockMessage = !isAuthenticated
              ? 'Sign in as admin to access'
              : 'Admin only';
            const shouldTriggerSignIn = !isAuthenticated && !isAdminOnly;

            const card = (
              <Card
                aria-disabled={locked}
                className={`h-full border border-transparent bg-card shadow-sm transition ${
                  locked
                    ? 'cursor-not-allowed opacity-60'
                    : 'hover:border-primary/40 hover:shadow-md'
                }`}
              >
                <CardHeader className='flex flex-row items-start justify-between space-y-0'>
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription className='mt-2 text-base'>
                      {item.description}
                    </CardDescription>
                  </div>
                  <div className='rounded-full bg-primary/10 p-3 text-primary'>
                    <Icon className='h-5 w-5' />
                  </div>
                </CardHeader>
                <CardContent>
                  {locked ? (
                    <div className='mt-6 flex items-center gap-2 text-sm text-muted-foreground'>
                      <Lock className='h-4 w-4' />
                      {lockMessage}
                    </div>
                  ) : (
                    <div className='mt-6 flex items-center text-sm font-medium text-primary'>
                      Open section
                      <ArrowRight className='ml-2 h-4 w-4 transition group-hover:translate-x-1' />
                    </div>
                  )}
                </CardContent>
              </Card>
            );

            if (locked) {
              return (
                <div
                  key={item.title}
                  className='group block h-full'
                  aria-disabled='true'
                >
                  <div className='pointer-events-none'>{card}</div>
                </div>
              );
            }

            if (shouldTriggerSignIn) {
              return (
                <button
                  key={item.title}
                  type='button'
                  onClick={handleSignIn}
                  className='group block h-full text-left'
                >
                  {card}
                </button>
              );
            }

            return (
              <Link
                key={item.title}
                href={item.href}
                className='group block h-full'
              >
                {card}
              </Link>
            );
          })}
        </section>
      </main>
    </div>
  );
};

export default HomePage;
