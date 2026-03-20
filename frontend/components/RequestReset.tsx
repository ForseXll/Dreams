'use client';

import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Form from './styles/Form';
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
    <Form method="post" onSubmit={handleSubmit}>
      <fieldset disabled={loading} aria-busy={loading}>
        <h2>Request a Password Reset</h2>
        <ErrorMessage error={error || undefined} />
        {!error && !loading && success ? <p>Success! Check your email for a reset link.</p> : null}
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
        <button type="submit">Request Reset!</button>
      </fieldset>
    </Form>
  );
}
