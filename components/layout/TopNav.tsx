import { Loader2, LogOut } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import type { MeUser } from '@/lib/hooks/useMe';

interface TopNavProps {
  user: MeUser | null;
  loading: boolean;
  onSignIn: () => void | Promise<void>;
  onSignOut: () => void | Promise<void>;
}

const getInitial = (user: MeUser) =>
  user.name?.[0]?.toUpperCase() ?? user.email?.[0]?.toUpperCase() ?? 'F';

const SignedInMenu = ({
  user,
  onSignOut,
}: {
  user: MeUser;
  onSignOut: () => void | Promise<void>;
}) => {
  const initials = getInitial(user);
  const primaryName = user.name ?? 'Account';
  const labelName = user.name ?? user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className='flex items-center gap-3 rounded-full border border-border/80 bg-card px-3 py-2 text-left transition hover:border-primary/50'
          type='button'
        >
          <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary'>
            {initials}
          </div>
          <div className='flex flex-col'>
            <span className='text-sm font-medium text-foreground'>
              {primaryName}
            </span>
            <span className='text-xs text-muted-foreground'>{user.email}</span>
          </div>
          <Badge variant='secondary' className='uppercase tracking-wide'>
            {user.role}
          </Badge>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-56'>
        <DropdownMenuLabel>
          <div className='flex flex-col'>
            <span className='text-sm font-semibold text-foreground'>
              {labelName}
            </span>
            <span className='text-xs text-muted-foreground'>{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className='flex items-center gap-2 text-destructive focus:text-destructive'
          onClick={onSignOut}
        >
          <LogOut className='h-4 w-4' />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SessionAction = ({ user, loading, onSignIn, onSignOut }: TopNavProps) => {
  if (loading && !user) {
    return (
      <span className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Loader2 className='h-4 w-4 animate-spin' />
        Verifying session...
      </span>
    );
  }

  if (user) {
    return <SignedInMenu user={user} onSignOut={onSignOut} />;
  }

  return (
    <Button onClick={onSignIn} size='sm' className='rounded-full px-5'>
      Sign in with GitHub
    </Button>
  );
};

export const TopNav = ({ user, loading, onSignIn, onSignOut }: TopNavProps) => (
  <header className='border-b border-border/70 bg-background/95 backdrop-blur'>
    <div className='mx-auto flex max-w-6xl items-center justify-between px-6 py-5'>
      <div className='select-none'>
        <span className='text-lg font-semibold tracking-tight text-foreground'>
          Finance Manager
        </span>
        <p className='text-sm text-muted-foreground'>
          Control your team&apos;s cashflow with ease.
        </p>
      </div>
      <div className='flex items-center gap-3'>
        <ThemeToggle />
        <SessionAction
          user={user}
          loading={loading}
          onSignIn={onSignIn}
          onSignOut={onSignOut}
        />
      </div>
    </div>
  </header>
);
