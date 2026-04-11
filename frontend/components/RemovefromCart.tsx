'use client';

import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import { useAppState } from '../lib/appState';

interface RemoveFromCartProps {
  className?: string;
  id: number | string;
}

export default function RemoveFromCart({ className, id }: RemoveFromCartProps) {
  const app = useAppState();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    setLoading(true);

    try {
      setError(null);
      await app.removeFromCart(id);
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ErrorMessage error={error || undefined} />
      <button
        className={className || 'text-[2.4rem] leading-none text-[var(--color-muted)] transition-colors hover:text-[var(--color-danger)] disabled:opacity-50'}
        title="Delete Item"
        onClick={remove}
        disabled={loading}
      >
        X
      </button>
    </>
  );
}
