'use client';

import { useEffect, useState } from 'react';
import { perPage } from '../config';
import type { Item as ItemType } from '../lib/api/types';
import { listItems } from '../lib/api';
import Item from './Item';
import Pagination from './Pagination';

interface ItemsProps {
  page: number;
  description?: string;
  title?: string;
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
      <section className="grid gap-6">
        <div className="space-y-2">
          <h1 className="m-0 text-[3.2rem] font-bold tracking-[-0.04em]">{title}</h1>
          {description ? <p className="m-0 max-w-[56rem] text-[1.5rem] leading-[1.7] text-[var(--color-muted)]">{description}</p> : null}
        </div>
        <div className="rounded-[10px] border border-[var(--color-border)] bg-white px-5 py-4 text-[1.5rem] text-[var(--color-muted)]">
          Loading items...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="grid gap-6">
        <div className="space-y-2">
          <h1 className="m-0 text-[3.2rem] font-bold tracking-[-0.04em]">{title}</h1>
          {description ? <p className="m-0 max-w-[56rem] text-[1.5rem] leading-[1.7] text-[var(--color-muted)]">{description}</p> : null}
        </div>
        <div className="rounded-[10px] border border-[var(--color-border)] bg-white px-5 py-4 text-[1.5rem] text-[var(--color-danger)]">
          Error loading items: {error.message}
        </div>
      </section>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <section className="grid gap-8">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-2">
          <h1 className="m-0 text-[3.2rem] font-bold tracking-[-0.04em]">{title}</h1>
          {description ? (
            <p className="m-0 max-w-[56rem] text-[1.5rem] leading-[1.7] text-[var(--color-muted)]">
              {description}
            </p>
          ) : null}
        </div>
        <div className="grid gap-3 sm:grid-cols-[auto_auto] lg:justify-self-end">
          <div className="rounded-[10px] border border-[var(--color-border)] bg-white px-4 py-3 text-[1.35rem] text-[var(--color-muted)]">
            <span className="font-semibold text-[var(--color-text)]">{total}</span> items
          </div>
          <div className="rounded-[10px] border border-[var(--color-border)] bg-white px-4 py-3 text-[1.35rem] text-[var(--color-muted)]">
            Page <span className="font-semibold text-[var(--color-text)]">{page}</span> of{' '}
            <span className="font-semibold text-[var(--color-text)]">{totalPages}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center lg:justify-end">
        <Pagination page={page} count={total} />
      </div>

      {items.length ? (
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-2">
          {items.map((item) => (
            <Item item={item} key={item.id} />
          ))}
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-[var(--color-border)] bg-white px-6 py-10 text-[1.5rem] text-[var(--color-muted)]">
          No items are available yet.
        </div>
      )}

      {items.length ? (
        <div className="flex justify-center">
          <Pagination page={page} count={total} />
        </div>
      ) : null}
    </section>
  );
}
