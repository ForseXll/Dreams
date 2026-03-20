'use client';

import type { ReactNode } from 'react';
import { useAppState } from '../lib/appState';

interface UserRenderProps {
  data: {
    me: any;
  };
  loading: boolean;
}

export default function User({ children }: { children: (value: UserRenderProps) => ReactNode }) {
  const app = useAppState();

  return children({
    loading: app.bootstrapping,
    data: {
      me: app.currentUser
        ? {
            ...app.currentUser,
            cart: app.cart,
            orders: [],
          }
        : null,
    },
  });
}
