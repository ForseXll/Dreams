'use client';

import { useState } from 'react';
import Error from './ErrorMessage';
import { useAppState } from '../lib/appState';

interface AddToCartProps {
  className?: string;
  children?: React.ReactNode;
  id: number | string;
}

export default function AddToCart({ className, id }: AddToCartProps) {
  const app = useAppState();
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setError(null);
      setLoading(true);
      await app.addToCart(id);
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Error error={error || undefined} />
      <button className={className} onClick={handleClick} disabled={loading}>
        Add{loading ? 'ing' : ''} to Cart
      </button>
    </>
  );
}
