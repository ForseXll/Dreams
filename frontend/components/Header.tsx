'use client';

import Link from 'next/link';
import Cart from './Cart';
import Nav from './Nav';
import Search from './Search';
import { containerClass, headerClass } from '../lib/ui';
import { motion } from 'framer-motion';

export default function Header() {
  return (
    <>
    <motion.header 
      className={headerClass}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`${containerClass} py-4`}>
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <motion.h1 
            className="text-[2.4rem] font-bold tracking-tight sm:text-[2.8rem]"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <Link 
              className="inline-flex items-center bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] bg-clip-text text-transparent hover:opacity-80 transition-opacity"
              href="/"
            >
              Dreams
            </Link>
          </motion.h1>

          {/* Navigation */}
          <Nav />
        </div>

        {/* Search Bar */}
        <motion.div 
          className="mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Search />
        </motion.div>
      </div>
      </motion.header>
      <Cart />
    </>
  );
}
