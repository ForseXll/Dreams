import { Query } from 'react-apollo';
import { CURRENT_USER_QUERY } from './User';
import Error from './ErrorMessage';
import Router from 'next/router';
import styled from 'styled-components';
import NameButton from '../components/styles/NameButton'

const AccountPage = styled.div`
    width: ${props => props.theme.maxWidth};
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 10px;
    border: 2px solid black;
    padding: 10px;
    margin: 5px;

    button{
        background: teal;
        justify-self: start;
        cursor: pointer;
    }
    .request{
        justify-self: center;
    }
`;

const Account = props => (
    <Query query={CURRENT_USER_QUERY}>
        {({ data, error, loading }) =>
        {
            if (error) return <Error error={error} />
            if (loading) return <p>loading..</p>
            console.log(data.me);
            if (data.me)
            {
                return (
                    <AccountPage>
                        <div>
                            <h1>Account Info</h1>
                        </div>
                        <h3>Hello {data.me.name}!</h3>
                        {console.log(data.me.permissions)}
                        <button onClick={() =>
                        {
                            if (data.me.permissions.includes("ADMIN", "PERMISSIONUPDATE"))
                            {
                                console.log("made it in")
                                Router.push({
                                    pathname: '/permissions',
                                    query: {
                                        id: data.me.id,
                                    },
                                }).catch(error => alert(error.message));
                            }
                            else
                            {
                                alert("You don't have permissions to go there.");
                            }
                        }}>Permissions</button>
                        <button className="request" disabled> Request Permissions Coming Soon</button>
                    </AccountPage>
                );
            }
        }}
    </Query >
)

export default Account;