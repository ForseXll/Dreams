'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Form from './styles/Form';
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
    <Form method="post" onSubmit={handleSubmit}>
      <fieldset disabled={loading} aria-busy={loading}>
        <h2>Reset Your Password</h2>
        <ErrorMessage error={error || undefined} />
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
        <label htmlFor="confirmPassword">
          Confirm Your Password
          <input
            type="password"
            name="confirmPassword"
            placeholder="confirmPassword"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </label>
        <button type="submit">Reset Password!</button>
      </fieldset>
    </Form>
  );
}
