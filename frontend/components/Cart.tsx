'use client';

import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import { useAppState } from '../lib/appState';
import { primaryButtonClass } from '../lib/ui';
import CartItem from './CartItem';
import TakeMyMoney from './TakeMyMoney';

export default function Cart() {
  const app = useAppState();
  const me = app.currentUser;

  if (!me) {
    return null;
  }

  return (
    <aside
      className={`fixed top-0 right-0 bottom-0 z-[5] grid h-full min-w-[36rem] grid-rows-[auto_1fr_auto] border-l border-[var(--color-border)] bg-white p-6 shadow-[-8px_0_24px_rgba(27,24,22,0.08)] transition-transform duration-200 ease-out max-[700px]:w-full max-[700px]:min-w-0 ${app.cartOpen ? 'translate-x-0' : 'translate-x-full'} w-[min(42vw,56rem)]`}
    >
      <header className="mb-8 border-b border-[var(--color-border)] pb-6">
        <button
          className="ml-auto block text-[3rem] leading-none text-[var(--color-muted)] transition-colors hover:text-[var(--color-text)]"
          onClick={app.closeCart}
          title="close"
        >
          &times;
        </button>
        <h3 className="m-0 text-[2.4rem] font-bold tracking-[-0.03em]">{me.name}'s Cart</h3>
        <p className="mb-0 mt-2 text-[1.5rem] text-[var(--color-muted)]">
          You have {app.cart.length} item{app.cart.length === 1 ? '' : 's'} in your cart.
        </p>
      </header>
      <ul className="m-0 list-none overflow-auto p-0">
        {app.cart.map((cartItem) => (
          <CartItem key={cartItem.id} cartItem={cartItem} />
        ))}
      </ul>
      <footer className="mt-8 grid grid-cols-[1fr_auto] items-center gap-4 border-t border-[var(--color-border)] pt-6">
        <p className="m-0 text-right text-[1.8rem] font-bold">{formatMoney(calcTotalPrice(app.cart))}</p>
        {app.cart.length ? (
          <TakeMyMoney>
            <button className={primaryButtonClass}>Check out</button>
          </TakeMyMoney>
        ) : null}
      </footer>
    </aside>
  );
}
