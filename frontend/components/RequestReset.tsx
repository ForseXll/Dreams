'use client';

import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { fieldsetClass, formClass, inputClass, primaryButtonClass } from '../lib/ui';
import { requestPasswordReset } from '../lib/api';

export default function RequestReset() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      setLoading(true);
      setSuccess(false);
      await requestPasswordReset({ email });
      setEmail('');
      setSuccess(true);
    } catch (nextError) {
      setError(nextError as Error);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={formClass} method="post" onSubmit={handleSubmit}>
      <fieldset className={fieldsetClass} disabled={loading} aria-busy={loading}>
        <h2 className="m-0 text-[2.2rem] font-bold tracking-[-0.03em]">Request a Password Reset</h2>
        <ErrorMessage error={error || undefined} />
        {!error && !loading && success ? (
          <p className="m-0 text-[1.5rem] text-[var(--color-muted)]">Success! Check your email for a reset link.</p>
        ) : null}
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
        <button className={primaryButtonClass} type="submit">Request Reset!</button>
      </fieldset>
    </form>
  );
}
