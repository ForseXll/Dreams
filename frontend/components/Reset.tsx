'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import { cardVariants, buttonVariants, typographyClasses, inputVariants, cn } from '../lib/ui';
import { resetPassword } from '../lib/api';

interface FloatingLabelInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
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
        className={cn(
          inputVariants({ variant: error ? 'error' : 'default', size: 'lg' }),
          'pt-6 pb-2',
          error && 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
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
    </div>
  );
}

interface ResetProps {
  resetToken: string;
}

export default function Reset({ resetToken }: ResetProps) {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<Error | { message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError({ message: 'Passwords do not match' });
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await resetPassword({ token: resetToken, password });
      setPassword('');
      setConfirmPassword('');
      router.push('/signup');
    } catch (nextError) {
      setError(nextError as Error);
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
          <h2 className={typographyClasses.h2}>Choose a new password</h2>
          <p className={cn(typographyClasses.body, typographyClasses.muted)}>
            Enter the new password twice so we can confirm the reset.
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
                Saving your new password.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <FloatingLabelInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Enter a new password"
          required
          disabled={loading}
        />

        <FloatingLabelInput
          id="confirmPassword"
          label="Confirm Your Password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          placeholder="Re-enter the new password"
          required
          disabled={loading}
          error={error && 'message' in error && error.message === 'Passwords do not match' ? 'Passwords do not match' : undefined}
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
                  Saving password...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Save new password
                </>
              )}
            </span>
          </button>
        </motion.div>
      </fieldset>
    </motion.form>
  );
}