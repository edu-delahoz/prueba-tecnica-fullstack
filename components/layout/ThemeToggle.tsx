import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTheme } from '@/components/providers/ThemeProvider';

export const ThemeToggle = () => {
  const { theme, toggleTheme, ready } = useTheme();
  const label =
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <Button
      type='button'
      variant='ghost'
      size='icon'
      className='relative h-10 w-10 rounded-full border border-border/70 text-foreground'
      onClick={toggleTheme}
      aria-label={label}
      title={label}
      disabled={!ready}
    >
      <Sun className='h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0' />
      <Moon className='absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100' />
    </Button>
  );
};
