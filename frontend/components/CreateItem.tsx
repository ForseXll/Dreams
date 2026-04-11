'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Form from './styles/Form';
import { createItem, uploadImageToCloudinary } from '../lib/api';

export default function CreateItem() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [image, setImage] = useState('');
  const [largeImage, setLargeImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(0);
  const [title, setTitle] = useState('');

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || !files[0]) {
      return;
    }

    setLoading(true);

    try {
      const uploaded = await uploadImageToCloudinary(files[0]);
      setImage(uploaded.image);
      setLargeImage(uploaded.largeImage);
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      setLoading(true);
      const item = await createItem({ title, description, image, largeImage, price: Number(price) });
      router.push(`/item?id=${item?.id}`);
      router.refresh();
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <ErrorMessage error={error || undefined} />
      <fieldset data-test="form" disabled={loading} aria-busy={loading}>
        <label htmlFor="file">
          Image
          <input
            type="file"
            id="file"
            name="file"
            placeholder="Upload an Image"
            required
            onChange={uploadFile}
          />
          {image ? <img src={image} alt="Upload Preview" /> : null}
        </label>

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

        <button type="submit">Submit</button>
      </fieldset>
    </Form>
  );
}
