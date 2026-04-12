'use client';

import NProgress from 'nprogress';
import { cloneElement, isValidElement, useState, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createCheckoutSession } from '../lib/api';
import { useAppState } from '../lib/appState';
import ErrorMessage from './ErrorMessage';

interface TakeMyMoneyProps {
  children?: ReactNode;
}

export default function TakeMyMoney({ children }: TakeMyMoneyProps) {
  const app = useAppState();
  const [error, setError] = useState<Error | null>(null);

  const startCheckout = async (event?: MouseEvent) => {
    event?.preventDefault();
    NProgress.start();

    try {
      setError(null);
      const session = await createCheckoutSession();

      if (!session?.url) {
        throw new Error('Unable to start checkout');
      }

      window.location.assign(session.url);
    } catch (err) {
      setError(err as Error);
    } finally {
      NProgress.done();
    }
  };

  if (!app.currentUser) {
    return null;
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {error && <ErrorMessage error={error} />}
      </AnimatePresence>
      {isValidElement(children) ? (
        cloneElement(children as ReactElement<{ onClick?: (event: MouseEvent) => void }>, {
          onClick: (event) => {
            startCheckout(event).catch(() => null);
          },
        })
      ) : (
        <motion.button
          onClick={(event) => void startCheckout(event)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          Check out
        </motion.button>
      )}
    </>
  );
}