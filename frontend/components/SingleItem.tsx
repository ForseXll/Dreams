'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AddToCart from './AddToCart';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import type { Item as ItemType } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { cardVariants, buttonVariants, typographyClasses, skeletonClass, cn } from '../lib/ui';
import { getItem } from '../lib/api';

interface SingleItemProps {
  id: number | string;
}

// Image skeleton for loading state
function ImageSkeleton() {
  return (
    <div className={cn(
      skeletonClass,
      "relative min-h-[280px] w-full overflow-hidden rounded-lg bg-[var(--color-surface-alt)] sm:min-h-[360px] lg:min-h-[420px]"
    )}>
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="h-12 w-12 text-[var(--color-text-muted)]"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    </div>
  );
}

export default function SingleItem({ id }: SingleItemProps) {
  const [error, setError] = useState<Error | null>(null);
  const [item, setItem] = useState<ItemType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchItem = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await getItem(id);

        if (active) {
          setItem(response);
        }
      } catch (nextError) {
        if (active) {
          setError(nextError as Error);
          setItem(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className={cn(cardVariants({ variant: "default" }), "mx-auto max-w-[1200px] overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]")}>
        <div className="bg-[var(--color-surface-alt)] p-4 sm:p-6 lg:border-r lg:border-[var(--color-border)]">
          <ImageSkeleton />
        </div>
        <div className="grid content-start gap-5 p-5 sm:gap-6 sm:p-8">
          <div className="space-y-3">
            <div className={cn(skeletonClass, "h-12 w-3/4")} />
            <div className={cn(skeletonClass, "h-24 w-full")} />
          </div>
          <div className={cn(cardVariants({ variant: "default", size: "sm" }), "flex flex-col gap-2")}>
            <div className={cn(skeletonClass, "h-4 w-20")} />
            <div className={cn(skeletonClass, "h-10 w-32")} />
          </div>
          <div className="grid gap-3">
            <div className={cn(skeletonClass, "h-12 w-full")} />
            <div className={cn(skeletonClass, "h-12 w-full")} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!item) {
    return (
      <StateMessage
        title="Item not found"
        description={`No item could be found for ${id}. It may have been removed or the link may be incomplete.`}
        tone="danger"
      />
    );
  }

  return (
    <motion.div 
      className={cn(
        cardVariants({ variant: "default" }),
"mx-auto max-w-[1200px] overflow-hidden lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(22rem,28rem)]"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Image Section */}
      <div className="bg-[var(--color-surface-alt)] p-4 sm:p-6 lg:border-r lg:border-[var(--color-border)]">
        <motion.div 
          className="relative min-h-[280px] w-full overflow-hidden rounded-xl bg-[var(--color-surface-elevated)] sm:min-h-[360px] lg:min-h-[420px]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          {item.largeImage || item.image ? (
            <Image
              className="object-contain"
              src={item.largeImage || item.image}
              alt={item.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[var(--color-text-muted)]">
              <div className="text-center">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="48" 
                  height="48" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="mx-auto mb-2"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <p className={cn(typographyClasses.small, typographyClasses.muted)}>
                  No image available
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Details Section */}
      <div className="grid content-start gap-5 p-5 sm:gap-6 sm:p-8">
        {/* Title & Description */}
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <h2 className={cn(typographyClasses.h2)}>{item.title}</h2>
          <p className={cn(typographyClasses.body, typographyClasses.muted, "leading-relaxed")}>
            {item.description}
          </p>
        </motion.div>

        {/* Price Card */}
        <motion.div 
          className={cn(cardVariants({ variant: "default", size: "sm" }))}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <p className={cn(
            "text-xs font-semibold uppercase tracking-wider",
            typographyClasses.muted
          )}>
            Price
          </p>
          <p className={cn(typographyClasses.h2, "mt-2")}>
            {formatMoney(item.price)}
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div 
          className="grid gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <AddToCart className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")} id={item.id}>
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
                  <circle cx="8" cy="21" r="1" />
                  <circle cx="19" cy="21" r="1" />
                  <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                </svg>
                Add to Cart
              </span>
            </AddToCart>
          </motion.div>
          
          <motion.button 
            className={cn(buttonVariants({ variant: "secondary", size: "lg" }), "w-full whitespace-normal")} 
            type="button" 
            disabled
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
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Shipping options coming soon
            </span>
          </motion.button>
        </motion.div>

        {/* Additional Info */}
        <motion.div 
          className="border-t border-[var(--color-border)] pt-5"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <p className={cn(typographyClasses.small, typographyClasses.muted, "leading-relaxed")}>
            Stored as a standard catalog item with a single primary image, a detailed description, and direct cart checkout from this page.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
