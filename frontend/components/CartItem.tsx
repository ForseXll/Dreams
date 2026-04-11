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
        This Item doesn't exist anymore!
        <RemoveFromCart id={cartItem.id} />
      </li>
    );
  }

  return (
    <li className="grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-[var(--color-border)] py-4">
      <img className="h-20 w-20 rounded-lg object-cover" src={cartItem.item.image} alt={cartItem.item.title} />
      <div className="cart-item-deets">
        <h3 className="m-0 text-[1.6rem] font-semibold">{cartItem.item.title}</h3>
        <p className="m-0 text-[1.4rem] text-[var(--color-muted)]">
          {formatMoney(cartItem.item.price * cartItem.quantity)}
          {'  --  '}
          <em>
            {cartItem.quantity} &times; {formatMoney(cartItem.item.price)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </li>
  );
}
