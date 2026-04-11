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
        <div className="space-y-2">
          <h2 className={formHeadingClass}>Create an account</h2>
          <p className={formHelperClass}>Set up a standard storefront account with your name, email, and password.</p>
        </div>
        <ErrorMessage error={error || undefined} />
        {loading ? <p className={formStatusClass}>Creating your account and preparing the storefront.</p> : null}
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
        <label className={formLabelClass} htmlFor="name">
          Name
          <input
            className={inputClass}
            type="text"
            name="name"
            placeholder="Your name"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label className={formLabelClass} htmlFor="password">
          Password
          <input
            className={inputClass}
            type="password"
            name="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="pt-2">
          <button className={primaryButtonClass} type="submit">{loading ? 'Creating account...' : 'Create account'}</button>
        </div>
      </fieldset>
    </form>
  );
}
