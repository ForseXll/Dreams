import React from 'react';
import { Query, Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { adopt } from 'react-adopt';


import User from './User';
import CartItem from './CartItem';
import calcTotalPrice from '../lib/calcTotalPrice';
import formatMoney from '../lib/formatMoney';
import TakeMyMoney from './TakeMyMoney';


import CartStyles from './styles/CartStyles';
import NameButton from './styles/NameButton';
import CloseButton from './styles/CloseButton';
import CheckOutButton from './styles/CheckOutButton';

const LOCAL_STATE_QUERY = gql`
    query {
        cartOpen @client
    }
`;

const TOGGLE_CART = gql`
    mutation {
        toggleCart @client
    }
`;

const Short = adopt({
    // solution to warning is to add render
    user: ({ render }) => <User>{render}</User>,
    toggleCart: ({ render }) => <Mutation mutation={TOGGLE_CART}>{render}</Mutation>,
    localState: ({ render }) => <Query query={LOCAL_STATE_QUERY}>{render}</Query>,
});

const Cart = () => (
    <Short>
        {({ user, toggleCart, localState }) =>
        {
            const me = user.data.me;
            if (!me) return null;
            return (
                <CartStyles open={localState.data.cartOpen}>
                    <header>
                        <CloseButton
                            onClick={toggleCart}
                            title="close"
                        >&times;</CloseButton>
                        <NameButton>{me.name}'s Cart</NameButton>
                        <p>You have {me.cart.length} item{me.cart.length === 1 ? '' : 's'} in your cart. </p>
                    </header>
                    <ul>
                        {me.cart.map(cartItem =>
                        {
                            return <CartItem key={cartItem.id} cartItem={cartItem} />
                        }
                        )}
                    </ul>
                    <footer>
                        <p className="money">{formatMoney(calcTotalPrice(me.cart))}</p>
                        {me.cart.length == 0 ? null : (
                            <TakeMyMoney>
                                <CheckOutButton>Check out</CheckOutButton>
                            </TakeMyMoney>
                        )}
                    </footer>
                </CartStyles>
            )
        }}
    </Short>
);

export default Cart;
export { LOCAL_STATE_QUERY, TOGGLE_CART };
