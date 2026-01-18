import '@/styles/globals.css';
import type { AppProps } from 'next/app';

import { AppFooter } from '@/components/layout/AppFooter';

const App = ({ Component, pageProps }: AppProps) => (
  <div className='flex min-h-screen flex-col bg-background'>
    <main className='flex-1'>
      <Component {...pageProps} />
    </main>
    <AppFooter />
  </div>
);

export default App;
