import React from 'react';
import StripeCheckout from 'react-stripe-checkout';
import { Mutation } from 'react-apollo';
import Router from 'next/router';
import NProgress from 'nprogress';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import calcTotalPrice from '../lib/calcTotalPrice';
import Error from './ErrorMessage';
import User, { CURRENT_USER_QUERY } from './User';

const CREATE_ORDER = gql`
    mutation createOrder($token: String!){
        createOrder(token: $token){
            id
            total
            charge
            items {
                id 
                title
            }
        }
    }
`;


function totalItems(cart)
{
    return cart.reduce((tally, cartItem) => tally + cartItem.quantity, 0);
}

class TakeMyMoney extends React.Component
{
    onToken = async (response, createOrder) =>
    {
        NProgress.start();
        //manually call the mutation once we have the stripe token
        const order = await createOrder({
            variables: {
                token: response.id,
            },
        }).catch(error =>
        {
            alert(error.message);
        });
        Router.push({
            pathname: '/order',
            query: {
                id: order.data.createOrder.id,
            }
        })

    }
    render()
    {
        return <User>
            {({ data: { me } }) => (
                <Mutation
                    mutation={CREATE_ORDER}
                    refetchQueries={[{ query: CURRENT_USER_QUERY }]}
                >
                    {createOrder => (
                        <StripeCheckout
                            amount={calcTotalPrice(me.cart)}
                            name="Sick Fits"
                            description={`Order of ${totalItems(me.cart)} Items.`}
                            image={me.cart.length && me.cart[0].item && me.cart[0].item.image}
                            stripeKey="pk_test_51HmPRXBA8QidMi7fNja8Od2CZ4PhhksbnGQcL2D1sQkMI4n830vJB5Xk1GKPZCIUCWgTALDSh1XNdPUhvaZgQIcI00dvEzN1Ky"
                            currency="USD"
                            email={me.email}
                            token={response => this.onToken(response, createOrder)}
                        >{this.props.children}</StripeCheckout>
                    )}
                </Mutation>
            )
            }
        </User>
    }
}

export default TakeMyMoney;