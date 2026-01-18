import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { AppFooter } from '@/components/layout/AppFooter';
import { ThemeProvider } from '@/components/providers/ThemeProvider';

const App = ({ Component, pageProps }: AppProps) => (
  <ThemeProvider>
    <div className='flex min-h-screen flex-col bg-background text-foreground'>
      <main className='flex-1'>
        <Component {...pageProps} />
      </main>
      <AppFooter />
    </div>
  </ThemeProvider>
);

export default App;
