'use client';

import { formatOrderDate, formatRelativeOrderDate } from '../lib/date';

interface TimeTextProps {
  mode: 'absolute' | 'relative';
  value: string;
}

export default function TimeText({ mode, value }: TimeTextProps) {
  const text = mode === 'absolute' ? formatOrderDate(value) : formatRelativeOrderDate(value);

  return <span suppressHydrationWarning>{text}</span>;
}
