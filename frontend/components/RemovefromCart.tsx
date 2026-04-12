'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import { buttonVariants, cn } from '../lib/ui';
import { useAppState } from '../lib/appState';

interface RemoveFromCartProps {
  className?: string;
  id: number | string;
}

export default function RemoveFromCart({ id }: RemoveFromCartProps) {
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
      <motion.button
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'h-8 w-8 rounded-lg text-[var(--color-text-muted)] hover:bg-[var(--color-danger-light)] hover:text-[var(--color-danger)]'
        )}
        title="Remove from cart"
        onClick={remove}
        disabled={loading}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Remove from cart"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      </motion.button>
    </>
  );
}