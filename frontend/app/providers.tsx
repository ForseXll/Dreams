'use client';

import type { ReactNode } from 'react';
import Page from '../components/Page';
import { AppProvider } from '../lib/appState';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppProvider>
      <Page>{children}</Page>
    </AppProvider>
  );
}
