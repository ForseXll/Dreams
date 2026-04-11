'use client';

import { useEffect, useState } from 'react';
import AddToCart from './AddToCart';
import ErrorMessage from './ErrorMessage';
import type { Item as ItemType } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { panelClass, primaryButtonClass } from '../lib/ui';
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
    return <p>Loading...</p>;
  }

  if (error) {
    return <ErrorMessage error={error} />;
  }

  if (!item) {
    return <p>No item found for {id}</p>;
  }

  return (
    <div className={`${panelClass} mx-auto grid max-w-[1200px] overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]`}>
      <img
        className="h-full min-h-[420px] w-full border-b border-[var(--color-border)] object-contain lg:border-r lg:border-b-0"
        src={item.largeImage || item.image}
        alt={item.title}
      />
      <div className="grid content-start gap-5 p-8">
        <h2 className="m-0 text-[2.8rem] font-bold tracking-[-0.03em]">Viewing {item.title}</h2>
        <p className="m-0 text-[1.6rem] leading-[1.65] text-[var(--color-muted)]">Item description: {item.description}</p>
        <p className="m-0 text-[2rem] font-bold">Price: {formatMoney(item.price)}</p>
        <AddToCart className={primaryButtonClass} id={item.id}>
          Add to Cart
        </AddToCart>
      </div>
    </div>
  );
}
