import React from 'react';
import Downshift from 'downshift';
import Router from 'next/router';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import debounce from 'lodash.debounce';
import { DropDown, DropDownItem, SearchStyles } from './styles/DropDown';

const SEARCH_ITEM_QUERY = gql`
    query SEARCH_ITEM_QUERY($searchTerm: String!){
        items(where: {
            OR: [
                {title_contains: $searchTerm} ,
                {description_contains: $searchTerm},
            ]
        }) {
            id 
            image
            title
        }
    }
`;

function route(item)
{
    Router.push({
        pathname: '/item',
        query: {
            id: item.id,
        },
    })
}

class AutoComplete extends React.Component
{
    state = {
        items: [],
        loading: false,
    }
    //debounce so you don't overload server with request. 
    onChange = debounce(async (event, client) =>
    {
        this.setState({ loading: true });
        //manually query apollo client
        const response = await client.query({
            query: SEARCH_ITEM_QUERY,
            variables: { searchTerm: event.target.value }
        });
        this.setState({
            items: response.data.items,
            loading: false,
        });
    }, 350);
    render()
    {
        return (
            < SearchStyles >
                <Downshift
                    itemToString={item => (item === null ? '' : item.title)}
                    onChange={route}
                >
                    {({ getInputProps, getItemProps, isOpen, inputValue, highlightedIndex }) => (

                        <div>
                            <ApolloConsumer>
                                {(client) => (
                                    <input
                                        {...getInputProps({
                                            type: 'search',
                                            placeholder: "Search for Item",
                                            id: "search",
                                            className: this.state.loading ? 'loading' : '',
                                            onChange: event =>
                                            {
                                                event.persist();
                                                this.onChange(event, client);
                                            },
                                        })}
                                    />
                                )}
                            </ApolloConsumer>
                            {isOpen && (
                                <DropDown>
                                    {this.state.items.map((item, index) => (
                                        <DropDownItem
                                            {...getItemProps({ item })}
                                            item
                                            key={item.id}
                                            highlighted={index === highlightedIndex}
                                        >
                                            <img width="50" src={item.image} alt={item.title} />
                                            {item.title}
                                        </DropDownItem>
                                    ))}
                                    {!this.state.items.length && !this.state.loading && (
                                        < DropDownItem >
                                            Nothing Found for "{inputValue}"
                                        </DropDownItem>
                                    )}
                                </DropDown>
                            )}
                        </div>
                    )}
                </Downshift>
            </SearchStyles >
        )
    }
}

export default AutoComplete;