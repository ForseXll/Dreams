'use client';

import NProgress from 'nprogress';
import { cloneElement, isValidElement, type MouseEvent, type ReactElement, type ReactNode } from 'react';
import { createCheckoutSession } from '../lib/api';
import { useAppState } from '../lib/appState';

interface TakeMyMoneyProps {
  children?: ReactNode;
}

export default function TakeMyMoney({ children }: TakeMyMoneyProps) {
  const app = useAppState();

  const startCheckout = async (event?: MouseEvent) => {
    event?.preventDefault();
    NProgress.start();

    try {
      const session = await createCheckoutSession();

      if (!session?.url) {
        throw new Error('Unable to start checkout');
      }

      window.location.assign(session.url);
    } catch (error) {
      window.alert((error as Error).message);
    } finally {
      NProgress.done();
    }
  };

  if (!app.currentUser) {
    return null;
  }

  if (isValidElement(children)) {
    return cloneElement(children as ReactElement<{ onClick?: (event: MouseEvent) => void }>, {
      onClick: (event) => {
        startCheckout(event).catch(() => null);
      },
    });
  }

  return <button onClick={(event) => void startCheckout(event)}>Check out</button>;
}
