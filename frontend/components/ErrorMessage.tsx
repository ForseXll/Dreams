'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { cn, statusVariants } from '../lib/ui';

type ErrorLike = {
  message?: string;
  networkError?: {
    result?: {
      errors?: Array<{ message: string }>;
    };
  };
};

function cleanMessage(message: string) {
  return message.replace('GraphQL error: ', '');
}

function ErrorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}

function ErrorBlock({ message }: { message: string }) {
  return (
    <motion.div
      className={cn(
        statusVariants({ variant: 'error' }),
        'flex items-start gap-3 rounded-lg border-l-4 border-l-[var(--color-danger)] p-4 my-4'
      )}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
    >
      <span className="mt-0.5 text-[var(--color-danger)]">
        <ErrorIcon />
      </span>
      <div>
        <p className="m-0 font-semibold text-[var(--color-danger-foreground)]" data-test="request-error">
          There was a problem.
        </p>
        <p className="m-0 mt-1 text-[var(--color-danger-foreground)] opacity-80">
          {cleanMessage(message)}
        </p>
      </div>
    </motion.div>
  );
}

export default function ErrorMessage({ error }: { error?: ErrorLike }) {
  if (!error || !error.message) {
    return null;
  }

  const networkErrors = error.networkError?.result?.errors;

  if (networkErrors && networkErrors.length) {
    return (
      <AnimatePresence>
        {networkErrors.map((networkError, index) => (
          <ErrorBlock key={index} message={networkError.message} />
        ))}
      </AnimatePresence>
    );
  }

  return <ErrorBlock message={error.message} />;
}