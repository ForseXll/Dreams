'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import {
  fieldsetClass,
  formClass,
  formHeadingClass,
  formHelperClass,
  formLabelClass,
  formStatusClass,
  inputClass,
  primaryButtonClass,
} from '../lib/ui';
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
    return (
      <StateMessage
        title="Loading item"
        description="Retrieving the current item fields before editing."
        tone="muted"
      />
    );
  }

  return (
    <form className={formClass} onSubmit={handleSubmit}>
      <ErrorMessage error={error || undefined} />
      <fieldset className={fieldsetClass} disabled={loading} aria-busy={loading}>
        <div className="space-y-2">
          <h2 className={formHeadingClass}>Update Item</h2>
          <p className={formHelperClass}>Adjust the title, price, or description and keep the current item listing in place.</p>
        </div>
        {loading ? <p className={formStatusClass}>Saving your item changes.</p> : null}

        <label className={formLabelClass} htmlFor="title">
          Title
          <input
            className={inputClass}
            type="text"
            id="title"
            name="title"
            placeholder="Title"
            required
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </label>

        <label className={formLabelClass} htmlFor="price">
          Price
          <input
            className={inputClass}
            type="number"
            id="price"
            name="price"
            placeholder="Price"
            required
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
          />
        </label>

        <label className={formLabelClass} htmlFor="description">
          Description
          <textarea
            className={`${inputClass} min-h-48 resize-y`}
            id="description"
            name="description"
            placeholder="Enter a Description"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="pt-2">
          <button className={primaryButtonClass} type="submit">{loading ? 'Saving changes...' : 'Save changes'}</button>
        </div>
      </fieldset>
    </form>
  );
}
