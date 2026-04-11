'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import { cardVariants, buttonVariants, typographyClasses, inputVariants, cn } from '../lib/ui';
import { getItem, updateItem } from '../lib/api';

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
    <motion.form 
      className={cn(cardVariants({ variant: "default" }), "max-w-3xl mx-auto p-8")}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <ErrorMessage error={error || undefined} />
      
      <fieldset className="space-y-8" disabled={loading} aria-busy={loading}>
        {/* Header */}
        <div className="space-y-2">
          <h2 className={cn(typographyClasses.h2)}>Update Item</h2>
          <p className={cn(typographyClasses.body, typographyClasses.muted)}>
            Adjust the title, price, or description and keep the current item listing in place.
          </p>
        </div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {loading && (
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
                Saving your changes...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Title Input */}
        <FloatingLabelInput
          id="title"
          label="Title"
          value={title}
          onChange={setTitle}
          placeholder="Enter item title"
          required
          disabled={loading}
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
          disabled={loading}
        />

        {/* Description Textarea */}
        <FloatingLabelTextarea
          id="description"
          label="Description"
          value={description}
          onChange={setDescription}
          placeholder="Enter item description"
          required
          disabled={loading}
          rows={6}
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
            disabled={loading}
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving changes...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save changes
                </>
              )}
            </span>
          </button>
        </motion.div>
      </fieldset>
    </motion.form>
  );
}
