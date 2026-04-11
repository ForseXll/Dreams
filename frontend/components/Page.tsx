'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Header from './Header';
import { pageClass, containerClass } from '../lib/ui';

interface PageProps {
  children: ReactNode;
}

export default function Page({ children }: PageProps) {
  return (
    <div className={pageClass}>
      <Header />
      <motion.main 
        className={`${containerClass} py-8 sm:py-10 lg:py-12`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {children}
      </motion.main>
    </div>
  );
}
