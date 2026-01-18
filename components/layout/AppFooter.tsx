import Link from 'next/link';
import { Github } from 'lucide-react';

export const AppFooter = () => (
  <footer className='border-t border-border/60 bg-background/95'>
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
      <a
        href='https://github.com/edu-delahoz'
        target='_blank'
        rel='noreferrer'
        className='inline-flex items-center justify-center gap-2 text-center font-medium text-foreground transition hover:text-primary sm:justify-start select-none'
        aria-label='Eduardo De La Hoz on GitHub'
      >
        <Github className='h-4 w-4' aria-hidden />
        Eduardo De La Hoz
      </a>
      <Link
        href='/api/docs'
        target='_blank'
        rel='noreferrer'
        className='text-center font-medium text-primary transition hover:text-primary/80 sm:text-right select-none'
      >
        API Docs
      </Link>
    </div>
  </footer>
);
