'use client';

import type { ReactNode } from 'react';
import Header from './Header';

interface PageProps {
  children: ReactNode;
}

export default function Page({ children }: PageProps) {
  return (
    <div className="min-h-screen text-[var(--color-text)]">
      <Header />
      <main className="mx-auto w-full max-w-[1200px] px-6 py-6">{children}</main>
    </div>
  );
}
