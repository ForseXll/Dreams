'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import ErrorMessage from './ErrorMessage';
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
import { createItem, uploadImageToCloudinary } from '../lib/api';

export default function CreateItem() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [image, setImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [largeImage, setLargeImage] = useState('');
  const [price, setPrice] = useState(0);
  const [title, setTitle] = useState('');
  const isBusy = isSaving || isUploadingImage;

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files || !files[0]) {
      return;
    }

    setError(null);
    setIsUploadingImage(true);

    try {
      const uploaded = await uploadImageToCloudinary(files[0]);
      setImage(uploaded.image);
      setLargeImage(uploaded.largeImage);
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      setIsSaving(true);
      const item = await createItem({ title, description, image, largeImage, price: Number(price) });
      router.push(`/item?id=${item?.id}`);
      router.refresh();
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form className={formClass} onSubmit={handleSubmit}>
      <ErrorMessage error={error || undefined} />
      <fieldset className={fieldsetClass} data-test="form" disabled={isBusy} aria-busy={isBusy}>
        <div className="space-y-2">
          <h2 className={formHeadingClass}>Create Item</h2>
          <p className={formHelperClass}>Add a catalog item with a title, one product image, a price, and a short description.</p>
        </div>
        {isUploadingImage ? <p className={formStatusClass}>Uploading your image.</p> : null}
        {isSaving ? <p className={formStatusClass}>Saving your item.</p> : null}

        <label className={formLabelClass} htmlFor="file">
          Image
          <input
            className={inputClass}
            type="file"
            id="file"
            name="file"
            required
            onChange={uploadFile}
          />
          {image ? (
            <div className="relative mt-4 h-56 w-full overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)]">
              {image ? (
                <Image
                  className="object-cover"
                  src={image}
                  alt="Upload Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              ) : null}
            </div>
          ) : null}
        </label>

        <label className={formLabelClass} htmlFor="title">
          Title
          <input
            className={inputClass}
            type="text"
            id="title"
            name="title"
            placeholder="Item title"
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
            placeholder="0"
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
            placeholder="Describe the item"
            required
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>

        <div className="pt-2">
          <button className={primaryButtonClass} type="submit">{isSaving ? 'Saving item...' : 'Create item'}</button>
        </div>
      </fieldset>
    </form>
  );
}
