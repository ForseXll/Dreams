'use client';

import { useEffect, useState } from 'react';
import { perPage } from '../config';
import type { Item as ItemType } from '../lib/api/types';
import { listItems } from '../lib/api';
import Item from './Item';
import Pagination from './Pagination';

interface ItemsProps {
  page: number;
}

export default function Items({ page }: ItemsProps) {
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
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error.message}</p>;
  }

  return (
    <div className="grid gap-8 text-center">
      <Pagination page={page} count={total} />
      <div className="mx-auto grid w-full max-w-[1200px] gap-6 md:grid-cols-2">
        {items.map((item) => (
          <Item item={item} key={item.id} />
        ))}
      </div>
      <Pagination page={page} count={total} />
    </div>
  );
}
