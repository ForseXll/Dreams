import React, { Component } from 'react';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import Error from './ErrorMessage';
import styled from 'styled-components';
import Head from 'next/head';
import formatMoney from '../lib/formatMoney';
import AddToCart from './AddToCart';

const SINGLE_ITEM_QUERY = gql`
    query SINGLE_ITEM_QUERY($id: ID!) {
        item(where: { id: $id }) {
            id
            title
            description
            price
            largeImage
        }
    }
`;

const Item = styled.div`
    max-width: 1200px;
    margin: 2rem auto;
    display: grid;
    grid-template-columns: 1fr;
    grid-auto-flow: column;
    min-height: 700px;
    box-shadow: ${props => props.theme.bs};
    border: 2px solid black;
    border-radius: 5px;
    img {
        width: 100%;
        height: 100%;
        object-fit: contain;
        border-right: 2px solid grey;
    }
    .details{
        display: grid;
        margin: 2rem;
        grid-template-rows: 1fr;
        grid-auto-flow: row;
    }
    button {
        display: block;
        background: teal;
    }
    p.price{
        font-size: 20px;
        font-weight: bold;
    }
`;

class SingleItem extends Component
{
    render()
    {
        return (

            <Query
                query={SINGLE_ITEM_QUERY}
                variables={{
                    id: this.props.id
                }}
            >
                {({ data, error, loading }) =>
                {
                    if (loading) return <p> Loading...</p>
                    if (error) return <Error error={error} />
                    if (!data.item) return <p>No item found for {this.props.id}</p>
                    return (
                        <Item>
                            <Head>
                                <title>Dreams! | {data.item.title}</title>
                            </Head>
                            <img src={data.item.largeImage} alt={data.item.title} />
                            <div className="details">
                                <h2>Viewing {data.item.title}</h2>
                                <p>Item description: {data.item.description}</p>
                                <p className="price">Price: {formatMoney(data.item.price)}</p>
                                <AddToCart className="cart" id={data.item.id}>Add to Cart</AddToCart>
                            </div>
                        </Item>
                    )
                }}
            </Query>
        )
    }
}

export default SingleItem;