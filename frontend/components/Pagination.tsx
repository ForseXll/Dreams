import Link from 'next/link';
import PaginationStyles from './styles/PaginationStyles';
import { perPage } from '../config';

interface PaginationProps {
  count: number;
  page: number;
}

export default function Pagination({ count, page }: PaginationProps) {
  const pages = Math.max(1, Math.ceil(count / perPage));

  return (
    <PaginationStyles>
      <Link
        className="prev"
        aria-disabled={page <= 1}
        href={{ pathname: '/shop', query: { page: Math.max(page - 1, 1) } }}
      >
        Prev
      </Link>
      <p>
        Page {page} of <span className="totalPages">{pages}</span>!
      </p>
      <Link
        className="next"
        aria-disabled={page >= pages}
        href={{ pathname: '/shop', query: { page: Math.min(page + 1, pages) } }}
      >
        Next
      </Link>
    </PaginationStyles>
  );
}
