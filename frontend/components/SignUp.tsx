'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import { cardVariants, buttonVariants, typographyClasses, cn } from '../lib/ui';
import { useAppState } from '../lib/appState';

// Floating Label Input Component
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
          "flex w-full rounded-lg border bg-[var(--color-surface-elevated)] px-3 pt-6 pb-2 text-sm transition-all duration-200 ease-out placeholder:text-[var(--color-text-subtle)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50",
          error 
            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]" 
            : "border-[var(--color-border)] focus:border-[var(--color-accent)]",
          "h-14"
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

export default function SignUp() {
  const app = useAppState();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setError(null);
      setLoading(true);
      await app.register({ email, name, password });
      setName('');
      setEmail('');
      setPassword('');
      router.push('/');
      router.refresh();
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      className={cn(cardVariants({ variant: "default" }), "max-w-md mx-auto p-8")}
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <fieldset className="space-y-6" disabled={loading} aria-busy={loading}>
        {/* Header */}
        <div className="space-y-2 text-center">
          <h2 className={cn(typographyClasses.h2)}>Create an account</h2>
          <p className={cn(typographyClasses.body, typographyClasses.muted)}>
            Join us today! Fill in your details below to get started.
          </p>
        </div>

        <ErrorMessage error={error || undefined} />
        
        {/* Loading Status */}
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
                Creating your account...
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Name Input */}
        <FloatingLabelInput
          id="name"
          label="Full Name"
          value={name}
          onChange={setName}
          placeholder="John Doe"
          required
          disabled={loading}
        />

        {/* Email Input */}
        <FloatingLabelInput
          id="email"
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          required
          disabled={loading}
          helper="We'll never share your email with anyone"
        />

        {/* Password Input */}
        <FloatingLabelInput
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          placeholder="Create a strong password"
          required
          disabled={loading}
          helper="Must be at least 8 characters"
        />

        {/* Submit Button */}
        <motion.div 
          className="pt-2"
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
                  Creating account...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" x2="20" y1="8" y2="14" />
                    <line x1="23" x2="17" y1="11" y2="11" />
                  </svg>
                  Create account
                </>
              )}
            </span>
          </button>
        </motion.div>

        {/* Footer Link */}
        <p className={cn(typographyClasses.small, typographyClasses.muted, "text-center")}>
          Already have an account?{' '}
          <a href="/signup" className="text-[var(--color-accent)] hover:underline font-medium">
            Sign in
          </a>
        </p>
      </fieldset>
    </motion.form>
  );
}
