'use client';

import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import { useAppState } from '../lib/appState';
import CartItem from './CartItem';
import TakeMyMoney from './TakeMyMoney';
import CloseButton from './styles/CloseButton';
import CartStyles from './styles/CartStyles';
import CheckOutButton from './styles/CheckOutButton';
import NameButton from './styles/NameButton';

export default function Cart() {
  const app = useAppState();
  const me = app.currentUser;

  if (!me) {
    return null;
  }

  return (
    <CartStyles open={app.cartOpen}>
      <header>
        <CloseButton onClick={app.closeCart} title="close">
          &times;
        </CloseButton>
        <NameButton>{me.name}'s Cart</NameButton>
        <p>
          You have {app.cart.length} item{app.cart.length === 1 ? '' : 's'} in your cart.
        </p>
      </header>
      <ul>
        {app.cart.map((cartItem) => (
          <CartItem key={cartItem.id} cartItem={cartItem} />
        ))}
      </ul>
      <footer>
        <p className="money">{formatMoney(calcTotalPrice(app.cart))}</p>
        {app.cart.length ? (
          <TakeMyMoney>
            <CheckOutButton>Check out</CheckOutButton>
          </TakeMyMoney>
        ) : null}
      </footer>
    </CartStyles>
  );
}
