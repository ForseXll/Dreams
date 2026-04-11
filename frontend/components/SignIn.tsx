'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { fieldsetClass, formClass, inputClass, primaryButtonClass } from '../lib/ui';
import { useAppState } from '../lib/appState';

export default function SignIn() {
  const app = useAppState();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      setLoading(true);
      await app.login({ email, password });
      setEmail('');
      setPassword('');
      router.push('/');
      router.refresh();
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={formClass} method="post" onSubmit={handleSubmit}>
      <fieldset className={fieldsetClass} disabled={loading} aria-busy={loading}>
        <h2 className="m-0 text-[2.2rem] font-bold tracking-[-0.03em]">Sign In to your Account</h2>
        <ErrorMessage error={error || undefined} />
        <label htmlFor="email">
          Email
          <input
            className={inputClass}
            type="email"
            name="email"
            placeholder="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label htmlFor="password">
          Password
          <input
            className={inputClass}
            type="password"
            name="password"
            placeholder="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button className={primaryButtonClass} type="submit">Sign In!</button>
      </fieldset>
    </form>
  );
}
