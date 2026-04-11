'use client';

import Link from 'next/link';
import CartCount from './CartCount';
import SignOut from './SignOut';
import { useAppState } from '../lib/appState';

const navLinkClass =
  'relative flex items-center px-4 py-5 font-semibold tracking-[-0.01em] transition-colors before:absolute before:left-0 before:top-1/2 before:block before:h-8 before:w-px before:-translate-y-1/2 before:bg-[var(--color-border)] hover:text-[var(--color-muted)]';

export default function Nav() {
  const app = useAppState();
  const me = app.currentUser;

  return (
    <ul className="flex w-full justify-center border-t border-[var(--color-border)] text-[1.5rem] lg:justify-end lg:border-t-0 lg:text-[1.6rem]">
      <li>
        <Link className={`${navLinkClass} before:hidden lg:before:block`} href="/shop">Shop</Link>
      </li>
      {me ? (
        <>
          <li>
            <Link className={navLinkClass} href="/sell">Sell</Link>
          </li>
          <li>
            <Link className={navLinkClass} href="/orders">Orders</Link>
          </li>
          <li>
            <Link className={navLinkClass} href="/account">Account</Link>
          </li>
          <li>
            <SignOut className={navLinkClass} />
          </li>
          <li>
            <button className={navLinkClass} onClick={app.toggleCart}>
              My Cart
              <CartCount count={app.cartCount} />
            </button>
          </li>
        </>
      ) : (
        <li>
          <Link className={`${navLinkClass} before:hidden lg:before:block`} href="/signup">Sign In</Link>
        </li>
      )}
    </ul>
  );
}
