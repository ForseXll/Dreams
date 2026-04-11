import { panelClass } from '../lib/ui';

interface StateMessageProps {
  description?: string;
  title: string;
  tone?: 'default' | 'danger' | 'muted';
}

const toneMap: Record<NonNullable<StateMessageProps['tone']>, string> = {
  danger: 'text-[var(--color-danger)]',
  default: 'text-[var(--color-text)]',
  muted: 'text-[var(--color-muted)]',
};

export default function StateMessage({ description, title, tone = 'default' }: StateMessageProps) {
  return (
    <div className={`${panelClass} px-6 py-8`}>
      <div className="space-y-2">
        <h2 className={`m-0 text-[2.1rem] font-bold tracking-[-0.03em] ${toneMap[tone]}`}>{title}</h2>
        {description ? (
          <p className="m-0 max-w-[48rem] text-[1.5rem] leading-[1.7] text-[var(--color-muted)]">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}
