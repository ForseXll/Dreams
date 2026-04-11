import Link from 'next/link';
import AddToCart from './AddToCart';
import DeleteItem from './DeleteItem';
import type { Item as ItemType } from '../lib/api/types';
import formatMoney from '../lib/formatMoney';

interface ItemProps {
  item: ItemType;
}

export default function Item({ item }: ItemProps) {
  return (
    <article className="relative flex flex-col overflow-hidden rounded-[10px] border border-[var(--color-border)] bg-white shadow-[0_4px_12px_rgba(27,24,22,0.08)]">
      {item.image ? (
        <img
          className="h-[320px] w-full border-b border-[var(--color-border)] object-cover"
          src={item.image}
          alt={item.title}
        />
      ) : null}
      <h3 className="m-0 px-6 pt-6 pb-2 text-left text-[2.3rem] font-bold leading-[1.25] tracking-[-0.03em]">
        <Link href={{ pathname: '/item', query: { id: item.id } }}>{item.title}</Link>
      </h3>
      <span className="absolute top-4 right-4 inline-block rounded-lg bg-[var(--color-accent)] px-4 py-3 text-[1.8rem] leading-none font-bold text-[var(--color-text)]">
        {formatMoney(item.price)}
      </span>
      <p className="m-0 flex-grow px-6 pb-6 text-left text-[1.5rem] leading-[1.6] text-[var(--color-muted)]">
        {item.description}
      </p>

      <div className="grid w-full grid-cols-3 gap-px border-t border-[var(--color-border)] bg-[var(--color-border)]">
        <Link
          className="bg-white px-3 py-4 text-[1.4rem] font-semibold leading-[1.2] text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-alt)]"
          href={{ pathname: '/update', query: { id: item.id } }}
        >
          Edit
        </Link>
        <DeleteItem
          className="bg-white px-3 py-4 text-[1.4rem] font-semibold leading-[1.2] text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-alt)]"
          id={item.id}
        >
          Delete this Item
        </DeleteItem>
        <AddToCart
          className="bg-white px-3 py-4 text-[1.4rem] font-semibold leading-[1.2] text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-alt)]"
          id={item.id}
        />
      </div>
    </article>
  );
}
