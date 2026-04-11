'use client';

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
  successStatusClass,
} from '../lib/ui';
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
        <div className="space-y-2">
          <h2 className={formHeadingClass}>Reset your password</h2>
          <p className={formHelperClass}>Enter the email on your account and we will send you a reset link.</p>
        </div>
        <ErrorMessage error={error || undefined} />
        {loading ? <p className={formStatusClass}>Sending your reset link.</p> : null}
        {!error && !loading && success ? <p className={successStatusClass}>Check your email for a password reset link.</p> : null}
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
        <div className="pt-2">
          <button className={primaryButtonClass} type="submit">{loading ? 'Sending link...' : 'Send reset link'}</button>
        </div>
      </fieldset>
    </form>
  );
}
