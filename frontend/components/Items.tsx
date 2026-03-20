'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { perPage } from '../config';
import type { Item as ItemType } from '../lib/api/types';
import { listItems } from '../lib/api';
import Item from './Item';
import Pagination from './Pagination';

interface ItemsProps {
  page: number;
}

const Center = styled.div`
    text-align: center;
`;

const ItemList = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 20px;
    margin: 0 auto;
    max-width: ${(props) => props.theme.maxWidth};
`;

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
    <Center>
      <Pagination page={page} count={total} />
      <ItemList>
        {items.map((item) => (
          <Item item={item} key={item.id} />
        ))}
      </ItemList>
      <Pagination page={page} count={total} />
    </Center>
  );
}
