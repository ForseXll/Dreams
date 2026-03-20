'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Form from './styles/Form';
import { getItem, updateItem } from '../lib/api';

interface UpdateItemProps {
  id: number | string;
}

export default function UpdateItem({ id }: UpdateItemProps) {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [itemLoading, setItemLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  const [title, setTitle] = useState('');

  useEffect(() => {
    let active = true;

    const fetchItem = async () => {
      try {
        setError(null);
        setItemLoading(true);
        const item = await getItem(id);

        if (!active || !item) {
          return;
        }

        setDescription(item.description || '');
        setPrice(item.price || 0);
        setTitle(item.title || '');
      } catch (nextError) {
        if (active) {
          setError(nextError as Error);
        }
      } finally {
        if (active) {
          setItemLoading(false);
        }
      }
    };

    fetchItem();

    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      setLoading(true);
      await updateItem(id, { title, description, price: Number(price) });
      router.push('/');
      router.refresh();
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setLoading(false);
    }
  };

  if (itemLoading) {
    return <p>Loading...</p>;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <ErrorMessage error={error || undefined} />
      <fieldset disabled={loading} aria-busy={loading}>
        <label htmlFor="title">
          Title
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label htmlFor="price">
          Price
          <input
            type="number"
            id="price"
            name="price"
            placeholder="Price"
            required
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
          />
        </label>

        <label htmlFor="description">
          Description
          <textarea
            id="description"
            name="description"
            placeholder="Enter a Description"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <button type="submit">Sav{loading ? 'ing' : 'e'} Changes</button>
      </fieldset>
    </Form>
  );
}
