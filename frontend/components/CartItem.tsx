import Image from 'next/image';
import formatMoney from '../lib/formatMoney';
import type { CartItem as CartItemType } from '../lib/api/types';
import RemoveFromCart from './RemovefromCart';

interface CartItemProps {
  cartItem: CartItemType;
}

export default function CartItem({ cartItem }: CartItemProps) {
  if (!cartItem.item) {
    return (
      <li className="grid grid-cols-[1fr_auto] items-center border-b border-[var(--color-border)] py-4 text-[1.5rem]">
        This item doesn&apos;t exist anymore.
        <RemoveFromCart id={cartItem.id} />
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[64px_1fr_auto] items-start gap-3 border-b border-[var(--color-border)] py-4 sm:grid-cols-[72px_1fr_auto] sm:gap-4">
      <div className="relative h-16 w-16 overflow-hidden rounded-lg border border-[var(--color-border)] sm:h-[72px] sm:w-[72px]">
        {cartItem.item.image ? (
          <Image
            className="object-cover"
            src={cartItem.item.image}
            alt={cartItem.item.title}
            fill
            sizes="72px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[var(--color-surface-alt)] text-[1.1rem] text-[var(--color-muted)]">
            N/A
          </div>
        )}
      </div>
      <div className="cart-item-deets space-y-1">
        <h3 className="m-0 text-[1.4rem] font-semibold leading-[1.35] sm:text-[1.5rem]">{cartItem.item.title}</h3>
        <p className="m-0 text-[1.35rem] font-semibold sm:text-[1.45rem]">{formatMoney(cartItem.item.price * cartItem.quantity)}</p>
        <p className="m-0 text-[1.2rem] text-[var(--color-muted)] sm:text-[1.3rem]">
          {cartItem.quantity} × {formatMoney(cartItem.item.price)}
        </p>
      </div>
      <RemoveFromCart className="mt-1 text-[2rem] leading-none text-[var(--color-muted)] transition-colors hover:text-[var(--color-danger)] disabled:opacity-50" id={cartItem.id} />
    </li>
  );
}
