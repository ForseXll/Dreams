'use client';

import Image from 'next/image';
import { useState } from 'react';
import { motion } from 'framer-motion';
import formatMoney from '../lib/formatMoney';
import { cn, typographyClasses, badgeVariants, buttonVariants } from '../lib/ui';
import { useAppState } from '../lib/appState';
import type { CartItem as CartItemType } from '../lib/api/types';
import RemoveFromCart from './RemovefromCart';

interface CartItemProps {
  cartItem: CartItemType;
}

export default function CartItem({ cartItem }: CartItemProps) {
  const app = useAppState();
  const [updating, setUpdating] = useState(false);

  if (!cartItem.item) {
    return (
      <motion.li
        className="flex items-center justify-between border-b border-[var(--color-border)] py-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <span className={cn(typographyClasses.body, typographyClasses.muted)}>
          This item doesn&apos;t exist anymore.
        </span>
        <RemoveFromCart id={cartItem.id} />
      </motion.li>
    );
  }

  const handleQuantityChange = async (newQuantity: number) => {
    setUpdating(true);
    try {
      await app.updateCartItemQuantity(cartItem.id, newQuantity);
    } catch {
    } finally {
      setUpdating(false);
    }
  };

  return (
    <motion.li
      className="flex items-center gap-4 border-b border-[var(--color-border)] py-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-[var(--color-border)] sm:h-24 sm:w-24">
        {cartItem.item.image ? (
          <Image
            className="object-cover"
            src={cartItem.item.image}
            alt={cartItem.item.title}
            fill
            sizes="96px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--color-surface-alt)] text-[var(--color-text-muted)]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086-2.654.442-4.572-4.572L3.414 15" />
            </svg>
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <h3 className={cn('m-0 truncate font-semibold', typographyClasses.body, 'leading-snug')}>
          {cartItem.item.title}
        </h3>
        <p className="m-0 mt-1 font-semibold text-[var(--color-text)]">
          {formatMoney(cartItem.item.price * cartItem.quantity)}
        </p>
        <div className="mt-2 flex items-center gap-2">
          <motion.button
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'h-8 w-8 p-0')}
            onClick={() => handleQuantityChange(cartItem.quantity - 1)}
            disabled={updating}
            whileTap={{ scale: 0.9 }}
            aria-label="Decrease quantity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
            </svg>
          </motion.button>
          <span className={cn(badgeVariants({ variant: 'default' }), 'min-w-[2.5rem] text-center tabular-nums')}>
            {cartItem.quantity} &times; {formatMoney(cartItem.item.price)}
          </span>
          <motion.button
            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'h-8 w-8 p-0')}
            onClick={() => handleQuantityChange(cartItem.quantity + 1)}
            disabled={updating}
            whileTap={{ scale: 0.9 }}
            aria-label="Increase quantity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </motion.button>
        </div>
      </div>
      <div className="shrink-0 self-start">
        <RemoveFromCart id={cartItem.id} />
      </div>
    </motion.li>
  );
}