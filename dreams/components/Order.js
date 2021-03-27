import React from 'react';
import PropTypes from 'prop-types';
import { Query } from 'react-apollo';
import { format } from 'date-fns';
import Head from 'next/head';
import gql from 'graphql-tag';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import OrderStyles from './styles/OrderStyles';

const SINGLE_ORDER_QUERY = gql`
    query SINGLE_ORDER_QUERY($id: ID!){
        order(id: $id){
            id 
            total
            charge
            createdAt
            user {
                id
            }
            items {
                id
                title
                description
                price
                image
                quantity
            }
        }
    }
`;

class Orders extends React.Component
{
    static propTypes = {
        id: PropTypes.string.isRequired,
    }
    render()
    {
        return (
            <Query
                query={SINGLE_ORDER_QUERY}
                variables={{ id: this.props.id }}
            >
                {({ data, error, loading }) =>
                {
                    if (error) return <Error error={error} />
                    if (loading) return <p>Loading....</p>
                    return (
                        <OrderStyles>
                            <Head>
                                <title>Sik Fits - {data.order.id}</title>
                            </Head>
                            <p> Order Id: {this.props.id} </p>
                            <p>
                                <span>Charge</span>
                                <span>{data.order.charge}</span>
                            </p>
                            <p>
                                <span>Date</span>
                                <span>{format(data.order.createdAt, 'MMMM d, YYYY h:mm a')}</span>
                            </p>
                            <p>
                                <span>Total</span>
                                <span>{formatMoney(data.order.total)}</span>
                            </p>
                            <p>
                                <span>Item Count</span>
                                <span>{data.order.items.length}</span>
                            </p>
                            {data.order.items.map(item => (
                                <div className="order-item">
                                    <img src={item.image} alt={item.title} />
                                    <div className="item-details">
                                        <h2>{item.title}</h2>
                                        <p>{item.description}</p>
                                        <p>Quantity: {item.quantity} </p>
                                        <p>Each: {formatMoney(item.price)}</p>
                                        <p>SubTotal: {formatMoney(item.price * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </OrderStyles>
                    )
                }}
            </Query>
        )
    }
}

export default Orders;