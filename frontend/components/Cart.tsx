'use client';

import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import { useAppState } from '../lib/appState';
import { primaryButtonClass, quietButtonClass } from '../lib/ui';
import CartItem from './CartItem';
import TakeMyMoney from './TakeMyMoney';

export default function Cart() {
  const app = useAppState();
  const me = app.currentUser;

  if (!me) {
    return null;
  }

  return (
    <>
      <button
        aria-hidden={!app.cartOpen}
        className={`fixed inset-0 z-[4] bg-[rgba(27,24,22,0.16)] transition-opacity ${app.cartOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={app.closeCart}
        tabIndex={-1}
        type="button"
      />
      <aside
        className={`fixed top-0 right-0 bottom-0 z-[5] grid h-full w-full min-w-0 grid-rows-[auto_1fr_auto] border-l border-[var(--color-border)] bg-white p-4 shadow-[-8px_0_24px_rgba(27,24,22,0.08)] transition-transform duration-200 ease-out sm:w-[min(42vw,56rem)] sm:min-w-[36rem] sm:p-6 ${app.cartOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <header className="mb-6 border-b border-[var(--color-border)] pb-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h3 className="m-0 text-[2.1rem] font-bold tracking-[-0.03em] sm:text-[2.4rem]">{me.name}&apos;s Cart</h3>
              <p className="mb-0 mt-2 text-[1.35rem] text-[var(--color-muted)] sm:text-[1.45rem]">
                {app.cart.length} item{app.cart.length === 1 ? '' : 's'} selected
              </p>
            </div>
            <button
              className={quietButtonClass}
              onClick={app.closeCart}
              title="close"
            >
              Close
            </button>
          </div>
        </header>
        <ul className="m-0 list-none overflow-auto p-0">
          {app.cart.length ? (
            app.cart.map((cartItem) => (
              <CartItem key={cartItem.id} cartItem={cartItem} />
            ))
          ) : (
            <li className="rounded-lg border border-dashed border-[var(--color-border)] px-4 py-6 text-[1.45rem] text-[var(--color-muted)]">
              Your cart is empty.
            </li>
          )}
        </ul>
        <footer className="mt-6 border-t border-[var(--color-border)] pt-5">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="m-0 text-[1.3rem] font-semibold uppercase tracking-[0.08em] text-[var(--color-muted)]">Total</p>
              <p className="m-0 mt-2 text-[2.1rem] font-bold tracking-[-0.04em] sm:text-[2.4rem]">{formatMoney(calcTotalPrice(app.cart))}</p>
            </div>
          </div>
          {app.cart.length ? (
            <TakeMyMoney>
              <button className={`${primaryButtonClass} w-full`}>Check out</button>
            </TakeMyMoney>
          ) : null}
        </footer>
      </aside>
    </>
  );
}
