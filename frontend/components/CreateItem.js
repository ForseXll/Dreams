import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import formatMoney from '../lib/formatMoney';
import Error from './ErrorMessage';
import Router from 'next/router';

const CREATE_ITEM_MUTATION = gql`
    mutation CREATE_ITEM_MUTATION(
            $title: String! 
            $description: String!
            $image: String 
            $largeImage: String
            $price: Int!
        ) {
        createItem(
            title: $title
            description: $description
            image: $image
            largeImage: $largeImage
            price: $price
        ){
            id
        }
        }
`;

class CreateItem extends Component
{
    state = {
        title: '',
        description: '',
        image: '',
        largeImage: '',
        price: 0,
    };

    handleChange = (event) =>
    {
        const { name, type, value } = event.target;
        const val = type === 'number' ? parseFloat(value) : value;
        this.setState({ [name]: val });
    };

    uploadFile = async event =>
    {
        const files = event.target.files;
        const data = new FormData();
        data.append('file', files[0]);
        data.append('upload_preset', 'Shopping');

        const res = await fetch('https://api.cloudinary.com/v1_1/dmgrjhxb7/image/upload', {
            method: 'POST',
            body: data,
        });

        const file = await res.json();
        this.setState({
            image: file.secure_url,
            largeImage: file.eager[0].secure_url,
        });
    };


    render()
    {
        return (
            <Mutation mutation={CREATE_ITEM_MUTATION} variables={this.state}>
                {(createItem, { loading, error }) => (
                    <Form onSubmit={async (event) =>
                    {
                        //stop form from submitting
                        event.preventDefault();
                        //call mutation
                        const response = await createItem();
                        //change page to new page
                        Router.push({
                            pathname: '/item',
                            query: { id: response.data.createItem.id }
                        })
                    }}>
                        <Error error={error} />
                        <fieldset data-test="form" disabled={loading} aria-busy={loading}>

                            <label htmlFor="file">
                                Image
                                <input
                                    type="file"
                                    id="file"
                                    name="file"
                                    placeholder="Upload an Image"
                                    required
                                    onChange={this.uploadFile}
                                />
                                {this.state.image && (<img src={this.state.image} alt={"Upload Preview"} />)}
                            </label>


                            <label htmlFor="title">
                                Title
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    placeholder="Title"
                                    required
                                    value={this.state.title}
                                    onChange={this.handleChange} />
                            </label>

                            <label htmlFor="price">
                                Price
                                <input
                                    type="number"
                                    id="price"
                                    name="price"
                                    placeholder="Price"
                                    required
                                    value={this.state.price}
                                    onChange={this.handleChange} />
                            </label>

                            <label htmlFor="description">
                                Description
                                <textarea
                                    id="description"
                                    name="description"
                                    placeholder="Enter a Description"
                                    required
                                    value={this.state.description}
                                    onChange={this.handleChange} />
                            </label>

                            <button type="submit">Submit</button>
                        </fieldset>
                    </Form>
                )}
            </Mutation>
        )

    }
}

export default CreateItem;