'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { fieldsetClass, formClass, inputClass, primaryButtonClass } from '../lib/ui';
import { useAppState } from '../lib/appState';

export default function SignUp() {
  const app = useAppState();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      setLoading(true);
      await app.register({ email, name, password });
      setName('');
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
        <h2 className="m-0 text-[2.2rem] font-bold tracking-[-0.03em]">Sign Up for an Account</h2>
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
        <label htmlFor="name">
          Name
          <input
            className={inputClass}
            type="text"
            name="name"
            placeholder="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
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
        <button className={primaryButtonClass} type="submit">Sign Up!</button>
      </fieldset>
    </form>
  );
}
