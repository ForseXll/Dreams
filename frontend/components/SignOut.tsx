'use client';

import { useAppState } from '../lib/appState';

export default function SignOut({ className }: { className?: string }) {
  const app = useAppState();
  return (
    <button className={className} onClick={app.logout}>
      Sign out
    </button>
  );
}
