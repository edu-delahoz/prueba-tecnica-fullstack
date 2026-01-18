import Link from 'next/link';

export const AppFooter = () => (
  <footer className='border-t border-border/60 bg-background/95'>
    <div className='mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between'>
      <span className='text-center sm:text-left'>Eduardo De La Hoz</span>
      <Link
        href='/api/docs'
        target='_blank'
        rel='noreferrer'
        className='text-center font-medium text-primary transition hover:text-primary/80 sm:text-right'
      >
        API Docs
      </Link>
    </div>
  </footer>
);
