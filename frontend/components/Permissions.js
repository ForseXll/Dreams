import { Query, Mutation } from 'react-apollo';
import Error from './ErrorMessage';
import gql from 'graphql-tag';
import Table from './styles/Table';
import PropTypes from 'prop-types';

const PossiblePermissions = [
    'ADMIN',
    'USER',
    'ITEMCREATE',
    'ITEMUPDATE',
    'ITEMDELETE',
    'PERMISSIONUPDATE',
];

const UPDATE_PERMISSIONS = gql`
    mutation updatePermissions($permissions: [Permission], $userId: ID! ) {
        updatePermissions(permissions:  $permissions, userId: $userId) {
            id
            permissions
            name
            email
        }
    }
`;

const ALL_USERS_QUERY = gql`
    query {
        users {
            id
            name
            email
            permissions
        }
    }
`;

const Permissions = (props) => (
    <Query query={ALL_USERS_QUERY}>
        {({ data, loading, error }) => console.log(data) || (
            <div>
                <Error error={error} />
                <div>
                    <h2> Mange Permissions </h2>
                    <Table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                {PossiblePermissions.map(permission => <th key={permission}>{permission}</th>)}
                                <th>Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.users.map(user => <UserPermissions user={user} />)}
                        </tbody>
                    </Table>
                </div>
            </div>
        )}
    </Query>
)

class UserPermissions extends React.Component
{
    static propTypes = {
        user: PropTypes.shape({
            name: PropTypes.string,
            email: PropTypes.string,
            id: PropTypes.string,
            permissions: PropTypes.array,
        }).isRequired,
    }

    state = {
        permissions: this.props.user.permissions,
    }
    handlePermission = (event) =>
    {
        const checkbox = event.target;
        //copy of current permissions
        let updatedPermissions = [...this.state.permissions];
        //figure ouy if we need to remove or add this permission
        if (checkbox.checked)
        {
            //add it in
            updatedPermissions.push(checkbox.value);

        } else
        {
            updatedPermissions = updatedPermissions.filter(permission => permission !== checkbox.value);
        }
        console.log(updatedPermissions);
        this.setState({ permissions: updatedPermissions });
    }
    render()
    {
        const user = this.props.user;
        return (
            <Mutation mutation={UPDATE_PERMISSIONS}
                variables={{
                    permissions: this.state.permissions,
                    userId: this.props.user.id,
                }}>
                {(updatePermissions, { loading, error }) => (
                    <>
                        { error && <tr><td colSpan="9"><Error error={error} /></td></tr>}
                        <tr>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            {PossiblePermissions.map(permission => (
                                <td>
                                    <label htmlFor={`${user.id}-permission-${permission}`}>
                                        <input type="checkbox"
                                            id={`${user.id}-permission-${permission}`}
                                            checked={this.state.permissions.includes(permission)}
                                            value={permission}
                                            onChange={this.handlePermission}
                                        />
                                    </label>
                                </td>)
                            )}
                            <td>
                                <button
                                    type="button"
                                    disabled={loading}
                                    onClick={updatePermissions}
                                >Updat{loading ? 'ing' : 'e'}</button>
                            </td>
                        </tr>
                    </>
                )}
            </Mutation>
        )
    }
}


export default Permissions;