import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import Router from 'next/router';

const SIGNUP_MUTATION = gql`
    mutation SIGNUP_MUTATION($email: String!, $name: String!, $password: String!){
        signUp(email: $email, name: $name, password: $password){
            id
            email
            name
        }
    }

`;

class SignUp extends Component
{
    state = {
        name: '',
        email: '',
        password: '',
    };
    SaveToState = (event) =>
    {
        this.setState({ [event.target.name]: event.target.value })
    }
    render()
    {
        return (
            <Mutation
                mutation={SIGNUP_MUTATION}
                variables={this.state}
                refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
                {(signUp, { error, loading }) =>
                {
                    return (<Form method="post" onSubmit={async event =>
                    {
                        event.preventDefault();
                        const response = await signUp();
                        this.setState({
                            name: '',
                            email: '',
                            password: '',
                        });
                        Router.push({
                            pathname: '/',
                            query: {
                                id: signUp.id
                            },
                        })
                    }}>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2> Sign Up for an Account</h2>
                            <Error error={error} />
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
                            <label htmlFor="name">
                                Name
                        <input
                                    type="text"
                                    name="name"
                                    placeholder="name"
                                    value={this.state.name}
                                    onChange={this.SaveToState}
                                />
                            </label>
                            <label htmlFor="password">
                                Password
                        <input
                                    type="password"
                                    name="password"
                                    placeholder="password"
                                    value={this.state.password}
                                    onChange={this.SaveToState}
                                />
                            </label>
                            <button type="submit" > Sign Up!</button>
                        </fieldset>
                    </Form>)
                }}
            </Mutation>
        )
    }
}

export default SignUp;