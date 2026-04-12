'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { buttonVariants, typographyClasses, cn } from '../lib/ui';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-surface-alt)]"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)]">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" x2="16.65" y1="21" y2="16.65" />
          </svg>
        </motion.div>

        <h1 className={cn(typographyClasses.h1, 'mb-4')}>Page not found</h1>
        <p className={cn(typographyClasses.body, typographyClasses.muted, 'mx-auto max-w-md')}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved. Try searching for what you need or head back to the storefront.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link href="/" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                Back to Store
              </span>
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link href="/shop" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                Browse Products
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}