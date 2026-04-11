'use client';

import { useState } from 'react';
import { useAppState } from '../lib/appState';

interface RemoveFromCartProps {
  className?: string;
  id: number | string;
}

export default function RemoveFromCart({ className, id }: RemoveFromCartProps) {
  const app = useAppState();
  const [loading, setLoading] = useState(false);

  const remove = async () => {
    setLoading(true);

    try {
      await app.removeFromCart(id);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={className || 'text-[2.4rem] leading-none text-[var(--color-muted)] transition-colors hover:text-[var(--color-danger)] disabled:opacity-50'}
      title="Delete Item"
      onClick={remove}
      disabled={loading}
    >
      X
    </button>
  );
}
