'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Error from './ErrorMessage';
import { buttonVariants, cn } from '../lib/ui';
import { useAppState } from '../lib/appState';

interface AddToCartProps {
  className?: string;
  children?: React.ReactNode;
  id: number | string;
}

export default function AddToCart({ children, className, id }: AddToCartProps) {
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
      <motion.button
        className={cn(buttonVariants({ variant: 'primary' }), className)}
        onClick={handleClick}
        disabled={loading}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Adding...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="8" cy="21" r="1" />
                <circle cx="19" cy="21" r="1" />
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
              </svg>
              {children || 'Add to Cart'}
            </>
          )}
        </span>
      </motion.button>
    </>
  );
}