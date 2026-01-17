import { type MouseEventHandler } from 'react';

import { authClient } from '@/lib/auth/client';

const LoginPage = () => {
  const handleSignIn: MouseEventHandler<HTMLButtonElement> = async (event) => {
    event.preventDefault();
    await authClient.signIn.social({
      provider: 'github',
      callbackURL: `${window.location.origin}/`,
    });
  };

  return (
    <main style={{ padding: 24 }}>
      <button onClick={handleSignIn}>Sign in with GitHub</button>
    </main>
  );
};

export default LoginPage;
