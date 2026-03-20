'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import AddToCart from './AddToCart';
import ErrorMessage from './ErrorMessage';
import type { Item as ItemType } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { getItem } from '../lib/api';

interface SingleItemProps {
  id: number | string;
}

const Item = styled.div`
    max-width: 1200px;
    margin: 2rem auto;
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-flow: column;
    min-height: 700px;
    border: 2px solid black;
    border-radius: 5px;
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-right: 2px solid grey;
    }
    .details {
        display: grid;
        margin: 2rem;
        grid-template-rows: 1fr;
        grid-auto-flow: row;
    }
    button {
        display: block;
        background: teal;
    }
    p.price {
        font-size: 20px;
        font-weight: bold;
    }
`;

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
    <Item>
      <img src={item.largeImage || item.image} alt={item.title} />
      <div className="details">
        <h2>Viewing {item.title}</h2>
        <p>Item description: {item.description}</p>
        <p className="price">Price: {formatMoney(item.price)}</p>
        <AddToCart className="cart" id={item.id}>
          Add to Cart
        </AddToCart>
      </div>
    </Item>
  );
}
