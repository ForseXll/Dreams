'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { buttonVariants, cn } from '../lib/ui';
import { deleteItem } from '../lib/api';

interface DeleteItemProps {
  className?: string;
  children?: React.ReactNode;
  id: number | string;
}

export default function DeleteItem({ children, className, id }: DeleteItemProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      setError(null);
      await deleteItem(id);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setConfirming(false);
      setDeleting(false);
    }
  };

  if (confirming) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          className="flex flex-col items-stretch gap-2"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
        >
          <motion.button
            className={cn(buttonVariants({ variant: 'destructive', size: 'sm' }), 'w-full')}
            onClick={handleDelete}
            disabled={deleting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="flex items-center justify-center gap-1">
              {deleting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Deleting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                  </svg>
                  Confirm Delete
                </>
              )}
            </span>
          </motion.button>
          <motion.button
            className={cn(buttonVariants({ variant: 'ghost', size: 'sm' }), 'w-full')}
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
            disabled={deleting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          {error && (
            <span className="text-sm text-[var(--color-danger)]">{error}</span>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <motion.button
      className={cn(
        buttonVariants({ variant: 'outline' }),
        'w-full',
        className
      )}
      onClick={() => setConfirming(true)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {children || (
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18" />
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
          </svg>
          Delete
        </span>
      )}
    </motion.button>
  );
}