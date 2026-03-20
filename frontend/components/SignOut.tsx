'use client';

import { useAppState } from '../lib/appState';

export default function SignOut() {
  const app = useAppState();
  return <button onClick={app.logout}>Sign out</button>;
}
