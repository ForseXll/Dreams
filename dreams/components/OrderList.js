import React from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import OrderItemStyles from './styles/OrderItemStyles';
import styled from 'styled-components';
import Link from 'next/link';
import { formatDistance } from 'date-fns';
import formatMoney from '../lib/formatMoney';

const QUERY_ORDER_LIST = gql`
    query QUERY_ORDER_LIST{
        orders(orderBy: createdAt_DESC){
            id
            total
            createdAt
            items {
                id 
                title
                price 
                description
                title 
                image
                quantity
            }
        }
    }
`;
const UlStyle = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(60%, 1fr));
    border: 2px solid black;
    justify-content: start;
    padding-inline-start: 0px;
    .img-list{
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(10, 1fr))
    }
`;

class OrderList extends React.Component
{
    render()
    {
        return (
            <Query
                query={QUERY_ORDER_LIST}
            >
                {({ data, error, loading }) =>
                {
                    if (error) return <Error error={error} />
                    if (loading) return <p>Loading....</p>
                    return (<>
                        <div>You have {data.orders.length} Order{(!data.orders.length === 1) ? '' : 's'}!</div>
                        <UlStyle>
                            {data.orders.map(item => (
                                <OrderItemStyles
                                    key={item.id}
                                >
                                    <Link
                                        href={{
                                            pathname: '/order',
                                            query: { id: item.id },
                                        }}
                                    >
                                        <a>
                                            <div className="order-meta">
                                                <p>{item.items.reduce((a, b) => a + b.quantity, 0)}</p>
                                                <p>{item.items.length} Products</p>
                                                <p>{formatDistance(item.createdAt, new Date())}</p>
                                                <p>Total: {formatMoney(item.total)}</p>
                                            </div>
                                            <div className="images">
                                                {item.items.map(image => (
                                                    <img className="img-list" src={image.image} alt={image.image} />
                                                ))}
                                            </div>
                                        </a>
                                    </Link>
                                </OrderItemStyles>
                            ))}
                        </UlStyle>
                    </>)
                }}
            </Query>
        )
    }
}

export default OrderList;