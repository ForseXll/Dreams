'use client';

import Link from 'next/link';
import CartCount from './CartCount';
import NavStyles from './styles/NavStyles';
import SignOut from './SignOut';
import { useAppState } from '../lib/appState';

export default function Nav() {
  const app = useAppState();
  const me = app.currentUser;

  return (
    <NavStyles>
      <Link href="/shop">Shop</Link>
      {me ? (
        <>
          <Link href="/sell">Sell</Link>
          <Link href="/orders">Orders</Link>
          <Link href="/account">Account</Link>
          <SignOut />
          <button onClick={app.toggleCart}>
            My Cart
            <CartCount count={app.cartCount} />
          </button>
        </>
      ) : (
        <Link href="/signup">Sign In</Link>
      )}
    </NavStyles>
  );
}
