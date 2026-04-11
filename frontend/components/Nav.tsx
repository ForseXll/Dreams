'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import CartCount from './CartCount';
import SignOut from './SignOut';
import { useAppState } from '../lib/appState';
import { cn } from '../lib/utils';

const navLinkClass =
  'relative inline-flex h-10 items-center justify-center rounded-lg px-3 text-[1.35rem] font-semibold transition-all duration-200 ease-out';

function getNavClass(isActive: boolean) {
  return cn(
    navLinkClass,
    isActive 
      ? 'bg-[var(--color-surface-alt)] text-[var(--color-text)]' 
      : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]/50 hover:text-[var(--color-text)]'
  );
}

export default function Nav() {
  const app = useAppState();
  const me = app.currentUser;
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1 sm:gap-2">
      <ul className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        <motion.li whileTap={{ scale: 0.95 }}>
          <Link 
            className={getNavClass(pathname === '/' || pathname === '/shop')} 
            href="/shop"
          >
            Shop
          </Link>
        </motion.li>
        
        {me ? (
          <>
            <motion.li whileTap={{ scale: 0.95 }}>
              <Link 
                className={getNavClass(pathname === '/sell')} 
                href="/sell"
              >
                Sell
              </Link>
            </motion.li>
            
            <motion.li whileTap={{ scale: 0.95 }}>
              <Link 
                className={getNavClass(pathname === '/orders' || pathname === '/order')} 
                href="/orders"
              >
                Orders
              </Link>
            </motion.li>
            
            <motion.li whileTap={{ scale: 0.95 }}>
              <Link 
                className={getNavClass(pathname === '/account' || pathname === '/permissions')} 
                href="/account"
              >
                Account
              </Link>
            </motion.li>
            
            <motion.li whileTap={{ scale: 0.95 }}>
              <SignOut className={getNavClass(false)} />
            </motion.li>
            
            <motion.li whileTap={{ scale: 0.95 }}>
              <motion.button 
                className={cn(
                  navLinkClass,
                  app.cartOpen 
                    ? 'bg-[var(--color-accent)] text-[var(--color-accent-foreground)]' 
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-alt)]/50'
                )}
                onClick={app.toggleCart}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                My Cart
                <CartCount count={app.cartCount} />
              </motion.button>
            </motion.li>
          </>
        ) : (
          <motion.li whileTap={{ scale: 0.95 }}>
            <Link 
              className={getNavClass(pathname === '/signup' || pathname === '/reset')} 
              href="/signup"
            >
              Sign In
            </Link>
          </motion.li>
        )}
      </ul>
    </nav>
  );
}
