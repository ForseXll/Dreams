'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import { cardVariants, buttonVariants, typographyClasses, statusVariants, inputVariants, cn } from '../lib/ui';
import { requestPasswordReset } from '../lib/api';

interface FloatingLabelInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
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
}: FloatingLabelInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = value.length > 0;
  const isActive = isFocused || hasValue;

  return (
    <div className="relative">
      <motion.label
        htmlFor={id}
        className={cn(
          'absolute left-3 z-10 origin-left transition-all duration-200',
          isActive
            ? 'top-1 text-xs font-semibold text-[var(--color-accent)]'
            : 'top-1/2 -translate-y-1/2 text-base text-[var(--color-text-muted)]'
        )}
        animate={{
          y: isActive ? 0 : '-50%',
          scale: isActive ? 0.85 : 1,
        }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {label}
        {required && <span className="ml-1 text-[var(--color-danger)]">*</span>}
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
        className={cn(inputVariants({ variant: 'default', size: 'lg' }), 'pt-6 pb-2')}
      />
    </div>
  );
}

export default function RequestReset() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      setLoading(true);
      setSuccess(false);
      await requestPasswordReset({ email });
      setEmail('');
      setSuccess(true);
    } catch (nextError) {
      setError(nextError as Error);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form
      className={cn(cardVariants({ variant: 'default' }), 'max-w-md mx-auto p-8')}
      method="post"
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <fieldset className="space-y-6" disabled={loading} aria-busy={loading}>
        <div className="space-y-2 text-center">
          <h2 className={typographyClasses.h2}>Reset your password</h2>
          <p className={cn(typographyClasses.body, typographyClasses.muted)}>
            Enter the email on your account and we will send you a reset link.
          </p>
        </div>

        <ErrorMessage error={error || undefined} />

        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              className={cn(
                cardVariants({ variant: 'default', size: 'sm' }),
                'border-l-4 border-l-[var(--color-info)] bg-[var(--color-info-light)]'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-2 text-[var(--color-info-foreground)]">
                <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Sending your reset link.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!error && !loading && success && (
            <motion.div
              className={cn(
                statusVariants({ variant: 'success' }),
                'border-l-4 border-l-[var(--color-success)]'
              )}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--color-success)]">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <span className="font-medium text-[var(--color-success-foreground)]">Check your email for a password reset link.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FloatingLabelInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          required
          disabled={loading}
        />

        <motion.div className="pt-2" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <button
            className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
            type="submit"
            disabled={loading}
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending link...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  Send reset link
                </>
              )}
            </span>
          </button>
        </motion.div>
      </fieldset>
    </motion.form>
  );
}