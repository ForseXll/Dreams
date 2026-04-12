'use client';

import { motion, AnimatePresence } from 'framer-motion';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import { useAppState } from '../lib/appState';
import { buttonVariants, typographyClasses, cn, cardVariants } from '../lib/ui';
import CartItem from './CartItem';
import TakeMyMoney from './TakeMyMoney';

export default function Cart() {
  const app = useAppState();
  const me = app.currentUser;

  if (!me) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {app.cartOpen && (
          <motion.button
            key="cart-backdrop"
            aria-hidden={!app.cartOpen}
            className="fixed inset-0 z-40 bg-[var(--color-text)]/20 backdrop-blur-sm"
            onClick={app.closeCart}
            tabIndex={-1}
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {app.cartOpen ? (
          <motion.aside
            key="cart-sidebar"
            className={cn(
              "fixed top-0 right-0 bottom-0 z-50 flex h-full flex-col",
              "w-full min-w-0",
              "border-l border-[var(--color-border)] bg-[var(--color-surface-elevated)]",
              "shadow-[-8px_0_30px_rgba(0,0,0,0.1)]",
              "sm:w-[min(50vw,42rem)] sm:min-w-[24rem]"
            )}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 300,
              mass: 0.8,
            }}
          >
            {/* Header */}
            <header className="shrink-0 border-b border-[var(--color-border)] bg-[var(--color-surface)]/50 px-5 py-5 backdrop-blur-xl sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className={cn(typographyClasses.h3)}>
                    {me.name}&apos;s Cart
                  </h3>
                  <p className={cn(typographyClasses.small, typographyClasses.muted, "mt-1")}>
                    {app.cart.length} item{app.cart.length === 1 ? '' : 's'} selected
                  </p>
                </div>
                <motion.button
                  className={buttonVariants({ variant: "ghost", size: "icon" })}
                  onClick={app.closeCart}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Close cart"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </motion.button>
              </div>
            </header>

            {/* Cart Items */}
            <div className="min-h-0 flex-1 overflow-auto px-5 py-4 sm:px-6">
              <AnimatePresence mode="popLayout">
                {app.cart.length ? (
                  <ul className="m-0 list-none p-0">
                    {app.cart.map((cartItem) => (
                      <CartItem key={cartItem.id} cartItem={cartItem} />
                    ))}
                  </ul>
                ) : (
                  <motion.div
                    className={cn(
                      cardVariants({ variant: "default" }),
                      "border-dashed px-4 py-6 text-center"
                    )}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-alt)]">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-[var(--color-text-muted)]"
                      >
                        <circle cx="8" cy="21" r="1" />
                        <circle cx="19" cy="21" r="1" />
                        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                      </svg>
                    </div>
                    <p className={cn(typographyClasses.body, typographyClasses.muted)}>
                      Your cart is empty.
                    </p>
                    <p className={cn(typographyClasses.small, typographyClasses.muted, "mt-1")}>
                      Start shopping to add items!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <footer className="shrink-0 border-t border-[var(--color-border)] bg-[var(--color-surface)]/50 px-5 py-5 backdrop-blur-xl sm:px-6">
              {app.cart.length ? (
                <>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <div>
                      <p className={cn(
                        "text-xs font-semibold uppercase tracking-wider",
                        typographyClasses.muted
                      )}>
                        Total
                      </p>
                      <p className={cn(typographyClasses.h2, "mt-1")}>
                        {formatMoney(calcTotalPrice(app.cart))}
                      </p>
                    </div>
                  </div>
                  <TakeMyMoney>
                    <motion.button
                      className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect width="20" height="14" x="2" y="5" rx="2" />
                          <line x1="2" x2="22" y1="10" y2="10" />
                        </svg>
                        Check out
                      </span>
                    </motion.button>
                  </TakeMyMoney>
                </>
              ) : null}
            </footer>
          </motion.aside>
        ) : null}
      </AnimatePresence>
    </>
  );
}