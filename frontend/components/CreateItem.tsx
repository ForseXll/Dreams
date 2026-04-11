'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import { cardVariants, buttonVariants, typographyClasses, inputVariants, cn } from '../lib/ui';
import { createItem, uploadImageToCloudinary } from '../lib/api';

// Floating Label Input Component
interface FloatingLabelInputProps {
  id: string;
  label: string;
  type?: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helper?: string;
}

function FloatingLabelInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  helper,
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = String(value).length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="relative">
      <motion.label
        htmlFor={id}
        className={cn(
          "absolute left-3 z-10 origin-left transition-all duration-200",
          isActive 
            ? "top-1 text-xs font-semibold text-[var(--color-accent)]" 
            : "top-1/2 -translate-y-1/2 text-base text-[var(--color-text-muted)]"
        )}
        animate={{
          y: isActive ? 0 : '-50%',
          scale: isActive ? 0.85 : 1,
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {label}
        {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
      </motion.label>
      
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isActive ? placeholder : ''}
        required={required}
        disabled={disabled}
        className={cn(
          inputVariants({ variant: error ? 'error' : 'default', size: 'lg' }),
          "pt-6 pb-2",
          error && "border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
        )}
      />
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            className="mt-1 text-sm text-[var(--color-danger)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      
      {helper && !error && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{helper}</p>
      )}
    </div>
  );
}

// Floating Label Textarea Component
interface FloatingLabelTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  rows?: number;
  error?: string;
  helper?: string;
}

function FloatingLabelTextarea({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  rows = 4,
  error,
  helper,
}: FloatingLabelTextareaProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="relative">
      <motion.label
        htmlFor={id}
        className={cn(
          "absolute left-3 z-10 origin-left transition-all duration-200",
          isActive 
            ? "top-1 text-xs font-semibold text-[var(--color-accent)]" 
            : "top-4 text-base text-[var(--color-text-muted)]"
        )}
        animate={{
          y: isActive ? 0 : 0,
          scale: isActive ? 0.85 : 1,
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {label}
        {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
      </motion.label>
      
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={isActive ? placeholder : ''}
        required={required}
        disabled={disabled}
        rows={rows}
        className={cn(
          inputVariants({ variant: error ? 'error' : 'default', size: 'lg' }),
          "min-h-[120px] resize-y pt-6 pb-2",
          error && "border-[var(--color-danger)] focus:ring-[var(--color-danger)]"
        )}
      />
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            className="mt-1 text-sm text-[var(--color-danger)]"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      
      {helper && !error && (
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">{helper}</p>
      )}
    </div>
  );
}

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
  const [dragActive, setDragActive] = useState(false);
  
  const isBusy = isSaving || isUploadingImage;

  const uploadFile = async (file: File) => {
    setError(null);
    setIsUploadingImage(true);

    try {
      const uploaded = await uploadImageToCloudinary(file);
      setImage(uploaded.image);
      setLargeImage(uploaded.largeImage);
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files[0]) return;
    await uploadFile(files[0]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await uploadFile(e.dataTransfer.files[0]);
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
    <motion.form 
      className={cn(cardVariants({ variant: "default" }), "max-w-3xl mx-auto p-8")}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <ErrorMessage error={error || undefined} />
      
      <fieldset className="space-y-8" disabled={isBusy} aria-busy={isBusy}>
        {/* Header */}
        <div className="space-y-2">
          <h2 className={cn(typographyClasses.h2)}>Create Item</h2>
          <p className={cn(typographyClasses.body, typographyClasses.muted)}>
            Add a catalog item with a title, one product image, a price, and a short description.
          </p>
        </div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {isUploadingImage && (
            <motion.div
              className={cn(
                cardVariants({ variant: "default", size: "sm" }),
                "border-l-4 border-l-[var(--color-info)] bg-[var(--color-info-light)]"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-2 text-[var(--color-info-foreground)]">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Uploading your image...
              </div>
            </motion.div>
          )}
          
          {isSaving && (
            <motion.div
              className={cn(
                cardVariants({ variant: "default", size: "sm" }),
                "border-l-4 border-l-[var(--color-success)] bg-[var(--color-success-light)]"
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-2 text-[var(--color-success-foreground)]">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving your item...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Image Upload */}
        <div className="space-y-2">
          <label className={cn("block text-sm font-semibold", typographyClasses.muted)}>
            Product Image
          </label>
          
          <div
            className={cn(
              "relative rounded-xl border-2 border-dashed p-8 transition-all duration-200",
              dragActive 
                ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]" 
                : "border-[var(--color-border)] bg-[var(--color-surface-alt)] hover:border-[var(--color-border-strong)]"
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              className="absolute inset-0 cursor-pointer opacity-0"
              type="file"
              id="file"
              name="file"
              accept="image/*"
              required={!image}
              onChange={handleFileChange}
            />
            
            {image ? (
              <motion.div 
                className="relative h-56 w-full overflow-hidden rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Image
                  className="object-cover"
                  src={image}
                  alt="Upload Preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                />
                <motion.button
                  type="button"
                  className={cn(
                    buttonVariants({ variant: "destructive", size: "sm" }),
                    "absolute top-2 right-2"
                  )}
                  onClick={() => {
                    setImage('');
                    setLargeImage('');
                  }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </motion.button>
              </motion.div>
            ) : (
              <div className="text-center">
                <motion.div 
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface)]"
                  animate={{ y: dragActive ? -5 : 0 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--color-text-muted)]">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" x2="12" y1="3" y2="15" />
                  </svg>
                </motion.div>
                <p className={cn(typographyClasses.body, "font-medium")}>
                  Drop an image here, or click to select
                </p>
                <p className={cn(typographyClasses.small, typographyClasses.muted, "mt-1")}>
                  Supports JPG, PNG, WebP up to 5MB
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Title Input */}
        <FloatingLabelInput
          id="title"
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="Enter a descriptive title"
          required
          disabled={isBusy}
        />

        {/* Price Input */}
        <FloatingLabelInput
          id="price"
          label="Price"
          type="number"
          value={price}
          onChange={(val) => setPrice(Number(val))}
          placeholder="0.00"
          required
          disabled={isBusy}
          helper="Enter the price in dollars"
        />

        {/* Description Textarea */}
        <FloatingLabelTextarea
          id="description"
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Describe your item in detail..."
          required
          disabled={isBusy}
          rows={6}
          helper="Minimum 10 characters recommended"
        />

        {/* Submit Button */}
        <motion.div 
          className="pt-4"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <button 
            className={cn(buttonVariants({ variant: "primary", size: "lg" }), "w-full")}
            type="submit"
            disabled={isBusy}
          >
            <span className="flex items-center justify-center gap-2">
              {isSaving ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving item...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                  Create item
                </>
              )}
            </span>
          </button>
        </motion.div>
      </fieldset>
    </motion.form>
  );
}
