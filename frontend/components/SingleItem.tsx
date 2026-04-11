'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import AddToCart from './AddToCart';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import type { Item as ItemType } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { panelClass, primaryButtonClass, secondaryButtonClass } from '../lib/ui';
import { getItem } from '../lib/api';

interface SingleItemProps {
  id: number | string;
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
      <StateMessage
        title="Loading item"
        description="Fetching the item details, image, and current price."
        tone="muted"
      />
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
    <div className={`${panelClass} mx-auto grid max-w-[1200px] overflow-hidden lg:grid-cols-[minmax(0,1fr)_28rem]`}>
      <div className="bg-[var(--color-surface-alt)] p-4 sm:p-6 lg:border-r lg:border-[var(--color-border)]">
        <div className="relative min-h-[280px] w-full overflow-hidden rounded-lg bg-white sm:min-h-[360px] lg:min-h-[420px]">
          {item.largeImage || item.image ? (
            <Image
              className="object-contain"
              src={item.largeImage || item.image}
              alt={item.title}
              fill
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-[1.4rem] text-[var(--color-muted)]">
              No image available
            </div>
          )}
        </div>
      </div>
      <div className="grid content-start gap-5 p-5 sm:gap-6 sm:p-8">
        <div className="space-y-3">
          <h2 className="m-0 text-[2.4rem] font-bold tracking-[-0.04em] sm:text-[3rem]">{item.title}</h2>
          <p className="m-0 text-[1.45rem] leading-[1.7] text-[var(--color-muted)] sm:text-[1.5rem]">{item.description}</p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-4">
          <p className="m-0 text-[1.3rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Price</p>
          <p className="mt-2 mb-0 text-[2.3rem] font-bold tracking-[-0.04em] sm:text-[2.8rem]">{formatMoney(item.price)}</p>
        </div>
        <div className="grid gap-3">
          <AddToCart className={primaryButtonClass} id={item.id}>
            Add to Cart
          </AddToCart>
          <button className={secondaryButtonClass} type="button" disabled>
            Shipping options coming soon
          </button>
        </div>
        <div className="border-t border-[var(--color-border)] pt-5">
          <p className="m-0 text-[1.35rem] leading-[1.7] text-[var(--color-muted)]">
            Stored as a standard catalog item with a single primary image, a detailed description, and direct cart checkout from this page.
          </p>
        </div>
      </div>
    </div>
  );
}
