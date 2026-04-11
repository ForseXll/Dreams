'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { perPage } from '../config';
import type { Item as ItemType } from '../lib/api/types';
import { listItems } from '../lib/api';
import Item from './Item';
import Pagination from './Pagination';
import { cardVariants, skeletonClass, typographyClasses, cn } from '../lib/ui';
import StateMessage from './StateMessage';

interface ItemsProps {
  page: number;
  description?: string;
  title?: string;
}

// Skeleton card component
function ItemSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      className={cn(
        cardVariants({ variant: "default" }),
        "flex h-full flex-col overflow-hidden"
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <div className={cn(skeletonClass, "h-[300px] w-full border-b border-[var(--color-border)]")} />
      <div className="flex flex-1 flex-col px-6 pt-6 pb-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className={cn(skeletonClass, "h-16 w-3/4")} />
          <div className={cn(skeletonClass, "h-8 w-20")} />
        </div>
        <div className={cn(skeletonClass, "h-20 w-full")} />
      </div>
      <div className="grid w-full grid-cols-3 gap-2 border-t border-[var(--color-border)] px-5 py-4">
        <div className={cn(skeletonClass, "h-10 w-full")} />
        <div className={cn(skeletonClass, "h-10 w-full")} />
        <div className={cn(skeletonClass, "h-10 w-full")} />
      </div>
    </motion.div>
  );
}

export default function Items({ page, description, title = 'Shop' }: ItemsProps) {
  const [error, setError] = useState<Error | null>(null);
  const [items, setItems] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchItems = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await listItems({
          skip: page * perPage - perPage,
          take: perPage,
        });

        if (!active || !response) {
          return;
        }

        setItems(response.items);
        setTotal(response.total);
      } catch (nextError) {
        if (active) {
          setError(nextError as Error);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchItems();

    return () => {
      active = false;
    };
  }, [page]);

  if (loading) {
    return (
      <section className="grid gap-8">
        {/* Header */}
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-2">
            <h1 className={cn(typographyClasses.h1)}>{title}</h1>
            {description ? (
              <p className={cn(typographyClasses.body, typographyClasses.muted, "max-w-[56rem]")}>
                {description}
              </p>
            ) : null}
          </div>
          <div className="flex gap-3">
            <div className={cn(skeletonClass, "h-12 w-32")} />
            <div className={cn(skeletonClass, "h-12 w-32")} />
          </div>
        </div>

        {/* Pagination Skeleton */}
        <div className="flex justify-center lg:justify-end">
          <div className={cn(skeletonClass, "h-12 w-48")} />
        </div>

        {/* Items Grid Skeleton */}
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-2">
          {Array.from({ length: perPage }).map((_, i) => (
            <ItemSkeleton key={i} index={i} />
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="grid gap-6">
        <StateMessage
          title="Error loading items"
          description={error.message}
          tone="danger"
        />
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <section className="grid gap-8">
      {/* Header */}
      <motion.div 
        className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="space-y-2">
          <h1 className={cn(typographyClasses.h1)}>{title}</h1>
          {description ? (
            <p className={cn(typographyClasses.body, typographyClasses.muted, "max-w-[56rem]")}>
              {description}
            </p>
          ) : null}
        </div>
        
        <div className="flex gap-3 lg:justify-self-end">
          <motion.div 
            className={cn(
              cardVariants({ variant: "default", size: "sm" }),
              "flex items-center gap-2"
            )}
            whileHover={{ scale: 1.02 }}
          >
            <span className={cn(typographyClasses.small, typographyClasses.muted)}>Items:</span>
            <span className="font-semibold text-[var(--color-text)]">{total}</span>
          </motion.div>
          
          <motion.div 
            className={cn(
              cardVariants({ variant: "default", size: "sm" }),
              "flex items-center gap-2"
            )}
            whileHover={{ scale: 1.02 }}
          >
            <span className={cn(typographyClasses.small, typographyClasses.muted)}>Page:</span>
            <span className="font-semibold text-[var(--color-text)]">{page}</span>
            <span className={cn(typographyClasses.small, typographyClasses.muted)}>of</span>
            <span className="font-semibold text-[var(--color-text)]">{totalPages}</span>
          </motion.div>
        </div>
      </motion.div>

      {/* Top Pagination */}
      <motion.div 
        className="flex justify-center lg:justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Pagination page={page} count={total} />
      </motion.div>

      {/* Items Grid */}
      {items.length ? (
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-2">
          {items.map((item, index) => (
            <Item item={item} key={item.id} index={index} />
          ))}
        </div>
      ) : (
        <motion.div 
          className={cn(
            cardVariants({ variant: "default" }),
            "border-dashed px-6 py-10 text-center"
          )}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className={cn(typographyClasses.body, typographyClasses.muted)}>
            No items are available yet.
          </p>
        </motion.div>
      )}

      {/* Bottom Pagination */}
      {items.length ? (
        <motion.div 
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Pagination page={page} count={total} />
        </motion.div>
      ) : null}
    </section>
  );
}
