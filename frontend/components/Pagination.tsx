import Link from 'next/link';
import { perPage } from '../config';

interface PaginationProps {
  count: number;
  page: number;
}

export default function Pagination({ count, page }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(count / perPage));

  return (
    <nav
      aria-label="Pagination"
      className="inline-grid grid-cols-[auto_auto_auto] items-stretch justify-center rounded-[10px] border border-[var(--color-border)] bg-white text-[1.45rem] font-semibold"
    >
      <Link
        className="px-5 py-3 transition-colors hover:bg-[var(--color-surface-alt)] aria-disabled:pointer-events-none aria-disabled:text-[var(--color-border)]"
        aria-disabled={page <= 1}
        href={{ pathname: '/shop', query: { page: Math.max(page - 1, 1) } }}
      >
        Prev
      </Link>
      <p className="m-0 border-x border-[var(--color-border)] px-5 py-3 text-[var(--color-muted)]">
        Page <span className="font-semibold text-[var(--color-text)]">{page}</span> of{' '}
        <span className="font-semibold text-[var(--color-text)]">{pages}</span>
      </p>
      <Link
        className="px-5 py-3 transition-colors hover:bg-[var(--color-surface-alt)] aria-disabled:pointer-events-none aria-disabled:text-[var(--color-border)]"
        aria-disabled={page >= pages}
        href={{ pathname: '/shop', query: { page: Math.min(page + 1, pages) } }}
      >
        Next
      </Link>
    </nav>
  );
}
