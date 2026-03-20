'use client';

import type { ReactNode } from 'react';
import type { CartItem, CurrentUser } from '../lib/api/types';
import { useAppState } from '../lib/appState';

interface UserRenderProps {
  data: {
    me: (CurrentUser & { cart: CartItem[]; orders: [] }) | null;
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
