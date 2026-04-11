'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import CartCount from './CartCount';
import SignOut from './SignOut';
import { useAppState } from '../lib/appState';

const navLinkClass =
  'relative inline-flex h-10 items-center justify-center rounded-lg px-3 text-[1.35rem] font-semibold tracking-[-0.01em] transition-colors hover:bg-[var(--color-surface-alt)] hover:text-[var(--color-text)] sm:text-[1.45rem] lg:text-[1.5rem]';

function getNavClass(isActive: boolean) {
  return `${navLinkClass} ${isActive ? 'bg-[var(--color-surface-alt)] text-[var(--color-text)]' : 'text-[var(--color-muted)]'}`;
}

export default function Nav() {
  const app = useAppState();
  const me = app.currentUser;
  const pathname = usePathname();

  return (
    <ul className="flex w-full flex-wrap items-center justify-center gap-2 sm:gap-2.5 lg:justify-end">
      <li>
        <Link className={getNavClass(pathname === '/' || pathname === '/shop')} href="/shop">Shop</Link>
      </li>
      {me ? (
        <>
          <li>
            <Link className={getNavClass(pathname === '/sell')} href="/sell">Sell</Link>
          </li>
          <li>
            <Link className={getNavClass(pathname === '/orders' || pathname === '/order')} href="/orders">Orders</Link>
          </li>
          <li>
            <Link className={getNavClass(pathname === '/account' || pathname === '/permissions')} href="/account">Account</Link>
          </li>
          <li>
            <SignOut className={getNavClass(false)} />
          </li>
          <li>
            <button className={getNavClass(app.cartOpen)} onClick={app.toggleCart}>
              My Cart
              <CartCount count={app.cartCount} />
            </button>
          </li>
        </>
      ) : (
        <li>
          <Link className={getNavClass(pathname === '/signup' || pathname === '/reset')} href="/signup">Sign In</Link>
        </li>
      )}
    </ul>
  );
}
