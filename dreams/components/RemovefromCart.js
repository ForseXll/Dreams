import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import { CURRENT_USER_QUERY } from './User';

const Button = styled.button`
    font-size: 3rem;
    background: none;
    border: 0;
    &:hover {
        color: pink;
        cursor: pointer;
    }
`;

const REMOVE_CART = gql`
    mutation REMOVE_CART($id: ID!){
        removeFromCart(id: $id){
            id
        }
    }
`;

class RemoveFromCart extends React.Component
{
    static propTypes = {
        id: PropTypes.string.isRequired,
    }
    //this gets called as soon as response from server gets back.
    update = (cache, payload) =>
    {
        //first read teh cache
        const data = cache.readQuery({
            query: CURRENT_USER_QUERY
        });
        //remove item from cart 
        const cartItemId = payload.data.removeFromCart.id;
        data.me.cart = data.me.cart.filter(cartItem => cartItem.id !== cartItemId);
        //write it back to cache
        cache.writeQuery({ query: CURRENT_USER_QUERY, data });
    }

    render()
    {
        return <Mutation
            mutation={REMOVE_CART}
            variables={{ id: this.props.id }}
            update={this.update}
            optimisticResponse={{
                __typename: 'Mutation',
                removeFromCart: {
                    __typename: 'CartItem',
                    id: this.props.id,
                }
            }}
        >
            {(removeFromCart, { loading, error }) => (
                <Button
                    title="Delete Item"
                    onClick={() =>
                    {
                        removeFromCart().catch(error => alert(error.message))
                    }}
                    disabled={loading}
                > X </Button>
            )}
        </Mutation >
    }

}

export default RemoveFromCart;