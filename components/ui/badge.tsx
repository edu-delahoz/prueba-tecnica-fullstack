import * as React from 'react';

import { cn } from '@/lib/utils';

const badgeVariants = {
  default: 'bg-primary text-primary-foreground shadow',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-input text-foreground',
};

type BadgeVariant = keyof typeof badgeVariants;

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export const Badge = ({
  className,
  variant = 'default',
  ...props
}: BadgeProps) => (
  <div
    className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
      badgeVariants[variant],
      className
    )}
    {...props}
  />
);
