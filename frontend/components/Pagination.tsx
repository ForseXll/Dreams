'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { perPage } from '../config';
import { cardVariants, buttonVariants, cn } from '../lib/ui';

interface PaginationProps {
  count: number;
  page: number;
}

export default function Pagination({ count, page }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(count / perPage));

  return (
    <motion.nav
      aria-label="Pagination"
      className={cn(
        cardVariants({ variant: "default" }),
        "inline-flex items-stretch overflow-hidden p-0"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Previous Button */}
      <motion.div
        whileHover={page > 1 ? { scale: 1.02 } : {}}
        whileTap={page > 1 ? { scale: 0.98 } : {}}
      >
        <Link
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "rounded-none border-r border-[var(--color-border)] px-5",
            page <= 1 && "pointer-events-none opacity-50"
          )}
          aria-disabled={page <= 1}
          href={{ pathname: '/shop', query: { page: Math.max(page - 1, 1) } }}
        >
          <span className="flex items-center gap-1">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Prev
          </span>
        </Link>
      </motion.div>

      {/* Page Info */}
      <div className="flex items-center border-r border-[var(--color-border)] px-5">
        <span className="text-sm font-medium text-[var(--color-text-muted)]">
          Page{' '}
          <span className="font-bold text-[var(--color-text)]">{page}</span>
          {' '}of{' '}
          <span className="font-bold text-[var(--color-text)]">{pages}</span>
        </span>
      </div>

      {/* Next Button */}
      <motion.div
        whileHover={page < pages ? { scale: 1.02 } : {}}
        whileTap={page < pages ? { scale: 0.98 } : {}}
      >
        <Link
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "rounded-none px-5",
            page >= pages && "pointer-events-none opacity-50"
          )}
          aria-disabled={page >= pages}
          href={{ pathname: '/shop', query: { page: Math.min(page + 1, pages) } }}
        >
          <span className="flex items-center gap-1">
            Next
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </span>
        </Link>
      </motion.div>
    </motion.nav>
  );
}
