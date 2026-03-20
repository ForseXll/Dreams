'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Form from './styles/Form';
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
    <Form method="post" onSubmit={handleSubmit}>
      <fieldset disabled={loading} aria-busy={loading}>
        <h2>Sign In to your Account</h2>
        <ErrorMessage error={error || undefined} />
        <label htmlFor="email">
          Email
          <input
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
            type="password"
            name="password"
            placeholder="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <button type="submit">Sign In!</button>
      </fieldset>
    </Form>
  );
}
