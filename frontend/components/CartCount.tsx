'use client';

import { motion } from 'framer-motion';
import { badgeVariants, cn } from '../lib/ui';

export default function CartCount({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <motion.span
      className={cn(
        badgeVariants({ variant: 'danger' }),
        'ml-1.5 inline-flex min-w-5 items-center justify-center px-1.5 py-0.5 text-[1rem] font-semibold leading-none [font-variant-numeric:tabular-nums]'
      )}
      key={count}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      {count}
    </motion.span>
  );
}