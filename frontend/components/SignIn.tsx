'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import {
  fieldsetClass,
  formClass,
  formHeadingClass,
  formHelperClass,
  formLabelClass,
  formStatusClass,
  inputClass,
  primaryButtonClass,
} from '../lib/ui';
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
        <div className="space-y-2">
          <h2 className={formHeadingClass}>Sign in</h2>
          <p className={formHelperClass}>Use the email and password tied to your storefront account.</p>
        </div>
        <ErrorMessage error={error || undefined} />
        {loading ? <p className={formStatusClass}>Signing you in and loading your account.</p> : null}
        <label className={formLabelClass} htmlFor="email">
          Email
          <input
            className={inputClass}
            type="email"
            name="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className={formLabelClass} htmlFor="password">
          Password
          <input
            className={inputClass}
            type="password"
            name="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="pt-2">
          <button className={primaryButtonClass} type="submit">{loading ? 'Signing in...' : 'Sign in'}</button>
        </div>
      </fieldset>
    </form>
  );
}
