import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';


const REQUEST_RESET_MUTATION = gql`
    mutation REQUEST_RESET_MUTATION($email: String!){
        requestReset(email: $email){
            message
        }
    }

`;

class RequestReset extends Component
{
    state = {
        email: '',
    };
    SaveToState = (event) =>
    {
        this.setState({ [event.target.name]: event.target.value })
    }
    render()
    {
        return (
            <Mutation
                mutation={REQUEST_RESET_MUTATION}
                variables={this.state}
            >
                {(reset, { error, loading, called }) =>
                {
                    return (<Form method="post" onSubmit={async event =>
                    {
                        event.preventDefault();
                        await reset();
                        this.setState({
                            email: '',
                        })
                    }}>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2> Request a Password Reset </h2>
                            <Error error={error} />
                            {!error && !loading && called && <p>Success! Check Email for link</p>}
                            <label htmlFor="email">
                                Email
                        <input
                                    type="email"
                                    name="email"
                                    placeholder="email"
                                    value={this.state.email}
                                    onChange={this.SaveToState}
                                />
                            </label>
                            <button type="submit" > Request Reset!</button>
                        </fieldset>
                    </Form>)
                }}
            </Mutation>
        )
    }
}

export default RequestReset;
export { REQUEST_RESET_MUTATION };