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
      <main className="mx-auto flex w-full max-w-[1200px] flex-col gap-8 px-4 py-6 sm:px-6 sm:py-8 lg:py-10">
        {children}
      </main>
    </div>
  );
}
