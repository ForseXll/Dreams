'use client';

import { motion } from 'framer-motion';
import { cn, typographyClasses, cardVariants } from '../lib/ui';

interface StateMessageProps {
  description?: string;
  title: string;
  tone?: 'default' | 'danger' | 'muted' | 'success' | 'info';
}

const toneToIcon: Record<NonNullable<StateMessageProps['tone']>, React.ReactNode> = {
  default: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  ),
  danger: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" x2="9" y1="9" y2="15" />
      <line x1="9" x2="15" y1="9" y2="15" />
    </svg>
  ),
  muted: (
    <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle className="opacity-25" cx="12" cy="12" r="10" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  success: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  info: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="16" y2="12" />
      <line x1="12" x2="12.01" y1="8" y2="8" />
    </svg>
  ),
};

const toneToTitleColor: Record<NonNullable<StateMessageProps['tone']>, string> = {
  default: 'text-[var(--color-text)]',
  danger: 'text-[var(--color-danger)]',
  muted: 'text-[var(--color-text-muted)]',
  success: 'text-[var(--color-success)]',
  info: 'text-[var(--color-info)]',
};

export default function StateMessage({ description, title, tone = 'default' }: StateMessageProps) {
  return (
    <motion.div
      className={cn(
        cardVariants({ variant: 'default', size: 'lg' }),
        'px-6 py-8'
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start gap-4">
        {toneToIcon[tone] && (
          <span className={cn('mt-0.5 shrink-0', toneToTitleColor[tone])}>
            {toneToIcon[tone]}
          </span>
        )}
        <div className="space-y-2">
          <h2 className={cn('m-0', typographyClasses.h3, toneToTitleColor[tone])}>{title}</h2>
          {description ? (
            <p className={cn('m-0 max-w-[48rem]', typographyClasses.body, typographyClasses.muted)}>
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}