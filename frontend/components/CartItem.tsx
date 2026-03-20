import formatMoney from '../lib/formatMoney';
import styled from 'styled-components';
import RemoveFromCart from './RemovefromCart';

interface CartItemProps {
  cartItem: any;
}

const CartItemStyle = styled.li`
    padding: 1rem 0;
    border-bottom: 1px solid black;
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr auto;
    img {
        width: 100px;
        margin: 10px;
    }
    h3, p {
        margin: 0px;
    }
`;

export default function CartItem({ cartItem }: CartItemProps) {
  if (!cartItem.item) {
    return (
      <CartItemStyle>
        This Item doesn't exist anymore!
        <RemoveFromCart id={cartItem.id} />
      </CartItemStyle>
    );
  }

  return (
    <CartItemStyle>
      <img src={cartItem.item.image} alt={cartItem.item.title} />
      <div className="cart-item-deets">
        <h3>{cartItem.item.title}</h3>
        <p>
          {formatMoney(cartItem.item.price * cartItem.quantity)}
          {'  --  '}
          <em>
            {cartItem.quantity} &times; {formatMoney(cartItem.item.price)} each
          </em>
        </p>
      </div>
      <RemoveFromCart id={cartItem.id} />
    </CartItemStyle>
  );
}
