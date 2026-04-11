import Image from 'next/image';
import Link from 'next/link';
import AddToCart from './AddToCart';
import DeleteItem from './DeleteItem';
import type { Item as ItemType } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';
import { destructiveButtonClass, secondaryButtonClass } from '../lib/ui';

interface ItemProps {
  item: ItemType;
}

export default function Item({ item }: ItemProps) {
  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-white shadow-[0_4px_12px_rgba(27,24,22,0.08)] transition-colors hover:border-[var(--color-text)]/20">
      {item.image ? (
        <div className="relative h-[300px] w-full border-b border-[var(--color-border)]">
          <Image
            className="object-cover"
            src={item.image}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col px-6 pt-6 pb-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="m-0 min-h-[5.8rem] max-w-[75%] text-left text-[2.1rem] font-bold leading-[1.35] tracking-[-0.03em]">
            <Link className="transition-colors group-hover:text-[var(--color-muted)]" href={{ pathname: '/item', query: { id: item.id } }}>
              {item.title}
            </Link>
          </h3>
          <span className="inline-flex shrink-0 items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-3 py-2 text-[1.6rem] leading-none font-bold text-[var(--color-text)]">
            {formatMoney(item.price)}
          </span>
        </div>
        <p className="m-0 flex-grow text-left text-[1.45rem] leading-[1.65] text-[var(--color-muted)]">
          {item.description}
        </p>
      </div>

      <div className="grid w-full grid-cols-1 gap-2 border-t border-[var(--color-border)] px-5 py-4 sm:grid-cols-3">
        <Link
          className={secondaryButtonClass}
          href={{ pathname: '/update', query: { id: item.id } }}
        >
          Edit
        </Link>
        <DeleteItem
          className={destructiveButtonClass}
          id={item.id}
        >
          Delete
        </DeleteItem>
        <AddToCart
          className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--color-text)] bg-[var(--color-text)] px-4 text-sm font-semibold leading-none text-[var(--color-surface)] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-text)] disabled:cursor-not-allowed disabled:opacity-50"
          id={item.id}
        >
          Add to Cart
        </AddToCart>
      </div>
    </article>
  );
}
