import Link from 'next/link';
import { perPage } from '../config';

interface PaginationProps {
  count: number;
  page: number;
}

export default function Pagination({ count, page }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(count / perPage));

  return (
    <div className="inline-grid grid-cols-[auto_auto_auto] items-stretch justify-center rounded-[10px] border border-[var(--color-border)] bg-white text-[1.5rem] font-bold">
      <Link
        className="px-5 py-3 transition-colors hover:bg-[var(--color-surface-alt)] aria-disabled:pointer-events-none aria-disabled:text-[var(--color-border)]"
        aria-disabled={page <= 1}
        href={{ pathname: '/shop', query: { page: Math.max(page - 1, 1) } }}
      >
        Prev
      </Link>
      <p className="m-0 px-5 py-3">
        Page {page} of <span>{pages}</span>!
      </p>
      <Link
        className="px-5 py-3 transition-colors hover:bg-[var(--color-surface-alt)] aria-disabled:pointer-events-none aria-disabled:text-[var(--color-border)]"
        aria-disabled={page >= pages}
        href={{ pathname: '/shop', query: { page: Math.min(page + 1, pages) } }}
      >
        Next
      </Link>
    </div>
  );
}
