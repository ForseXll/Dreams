import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import { ALL_ITEMS_QUERY } from './Items';

const DELETE_ITEM = gql`
    mutation DELETE_ITEM( $id: ID!){
        deleteItem( id: $id){
            id
        }
    }
`;


class DeleteItem extends Component
{
    //update page manually
    update = (cache, payload) =>
    {
        //1. read cache data
        const data = cache.readQuery({ query: ALL_ITEMS_QUERY });
        //2.read payload
        //3. filter the deleted item out of the page list
        data.items = data.items.filter(item => item.id !== payload.data.deleteItem.id);
        //put them back into query
        cache.writeQuery({ query: ALL_ITEMS_QUERY, data });
    }
    render()
    {
        return (
            <Mutation mutation={DELETE_ITEM} variables={{ id: this.props.id }} update={this.update}
                refetchQueries={[{ query: ALL_ITEMS_QUERY }]}
            >
                {(deleteItem, { error }) => (
                    <button onClick={() =>
                    {
                        if (confirm('Are you sure you want to delete this item?'))
                        {
                            deleteItem().catch(error =>
                            {
                                alert(error.message);
                            });
                        }
                    }
                    }
                    >
                        { this.props.children}
                    </button>
                )}
            </Mutation>
        )
    }
};

export default DeleteItem;