import React from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { CURRENT_USER_QUERY } from './User';

const ADD_TO_CART = gql`
    mutation ADD_TO_CART($id: ID!){
        addToCart(id: $id){
            id
            quantity
        }

    }
`;


class AddToCart extends React.Component
{
    render()
    {
        const { id } = this.props;
        return <Mutation
            mutation={ADD_TO_CART}
            variables={{
                id,
            }}
            refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        >
            {(addToCart, { error, loading }) =>
            {
                if (error) return <Error error={error} />
                return (<button onClick={addToCart}
                    disabled={loading}
                > Add{loading && 'ing'} to Cart </button>);
            }
            }
        </Mutation >
    }
}

export default AddToCart;