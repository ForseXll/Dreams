'use client';

import { useEffect, useState } from 'react';
import { formatOrderDate, formatRelativeOrderDate } from '../lib/date';

interface TimeTextProps {
  mode: 'absolute' | 'relative';
  value: string;
}

export default function TimeText({ mode, value }: TimeTextProps) {
  const [text, setText] = useState(() => (mode === 'absolute' ? formatOrderDate(value) : ''));

  useEffect(() => {
    if (mode === 'absolute') {
      setText(formatOrderDate(value));
      return;
    }

    setText(formatRelativeOrderDate(value));
  }, [mode, value]);

  return <span suppressHydrationWarning>{text}</span>;
}
