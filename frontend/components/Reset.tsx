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
import { resetPassword } from '../lib/api';

interface ResetProps {
  resetToken: string;
}

export default function Reset({ resetToken }: ResetProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<Error | { message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError({ message: 'Passwords do not match' });
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await resetPassword({ token: resetToken, password });
      setPassword('');
      setConfirmPassword('');
      router.push('/signup');
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
          <h2 className={formHeadingClass}>Choose a new password</h2>
          <p className={formHelperClass}>Enter the new password twice so we can confirm the reset.</p>
        </div>
        <ErrorMessage error={error || undefined} />
        {loading ? <p className={formStatusClass}>Saving your new password.</p> : null}
        <label className={formLabelClass} htmlFor="password">
          Password
          <input
            className={inputClass}
            type="password"
            name="password"
            placeholder="Enter a new password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <label className={formLabelClass} htmlFor="confirmPassword">
          Confirm Your Password
          <input
            className={inputClass}
            type="password"
            name="confirmPassword"
            placeholder="Re-enter the new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        <div className="pt-2">
          <button className={primaryButtonClass} type="submit">{loading ? 'Saving password...' : 'Save new password'}</button>
        </div>
      </fieldset>
    </form>
  );
}
