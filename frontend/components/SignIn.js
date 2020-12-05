import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User';
import Router from 'next/router';

const SIGNIN_MUTATION = gql`
    mutation SIGNIN_MUTATION($email: String!, $password: String!){
        signIn(email: $email, password: $password){
            id
            email
            name
        }
    }

`;

class SignIn extends Component
{
    state = {
        email: '',
        name: '',
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
                mutation={SIGNIN_MUTATION}
                variables={this.state}
                refetchQueries={[{ query: CURRENT_USER_QUERY }]}
            >
                {(signIn, { error, loading }) =>
                {
                    return (<Form method="post" onSubmit={async event =>
                    {
                        event.preventDefault();
                        await signIn();
                        this.setState({
                            name: '',
                            email: '',
                            password: '',
                        });
                        console.log(signIn.id);
                        console.log("singin!")
                        Router.push({
                            pathname: '/',
                            query: {
                                id: signIn.id,
                            },
                        });
                    }}>
                        <fieldset disabled={loading} aria-busy={loading}>
                            <h2> Sign In to your Account</h2>
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
                            <button type="submit" > Sign In!</button>
                        </fieldset>
                    </Form>)
                }}
            </Mutation>
        )
    }
}

export default SignIn;