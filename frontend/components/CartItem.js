import React from 'react';
import formatMoney from '../lib/formatMoney';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import RemoveFromCart from './RemovefromCart';

const CartItemStyle = styled.li`
    padding: 1rem 0;
    border-bottom: 1px solid black;
    display: grid;
    align-items: center;
    grid-template-columns: auto 1fr auto;
    img{
        width: 100px;
        margin: 10px;
    }
    h3, p{
        margin: 0px;
    }
`;

const CartItem = (props) =>
{
    if (!props.cartItem.item) return <CartItemStyle>
        This Item doesn't exist anymore!
        <RemoveFromCart id={props.cartItem.id} />
    </CartItemStyle>
    return (
        <CartItemStyle>
            <img src={props.cartItem.item.image} alt={props.cartItem.item.title} />
            <div className="cart-item-deets">
                <h3>{props.cartItem.item.title}</h3>
                <p>
                    {formatMoney(props.cartItem.item.price * props.cartItem.quantity)}
                    {`  --  `}
                    <em>
                        {props.cartItem.quantity} &times; {formatMoney(props.cartItem.item.price)} each
                </em>
                </p>
            </div>
            <RemoveFromCart id={props.cartItem.id} />
        </CartItemStyle>
    )
}

CartItem.propTypes = {
    cartItem: PropTypes.object.isRequired,
}

export default CartItem;