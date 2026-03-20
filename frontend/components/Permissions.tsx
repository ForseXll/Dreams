'use client';

import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import Table from './styles/Table';
import type { PermissionName, UserWithPermissions } from '../lib/api/types';
import { listUsers, updateUserPermissions } from '../lib/api';

const POSSIBLE_PERMISSIONS: PermissionName[] = [
  'ADMIN',
  'USER',
  'ITEMCREATE',
  'ITEMUPDATE',
  'ITEMDELETE',
  'PERMISSIONUPDATE',
];

export default function Permissions() {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserWithPermissions[]>([]);

  useEffect(() => {
    let active = true;

    const fetchUsers = async () => {
      try {
        setError(null);
        setLoading(true);
        const response = await listUsers();

        if (active) {
          setUsers(response);
        }
      } catch (nextError) {
        if (active) {
          setError(nextError as Error);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      active = false;
    };
  }, []);

  const handleSaved = (updatedUser: UserWithPermissions) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <ErrorMessage error={error || undefined} />
      <div>
        <h2>Manage Permissions</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {POSSIBLE_PERMISSIONS.map((permission) => (
                <th key={permission}>{permission}</th>
              ))}
              <th>Update</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserPermissions key={user.id} user={user} onSaved={handleSaved} />
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

function UserPermissions({ onSaved, user }: { onSaved: (user: UserWithPermissions) => void; user: UserWithPermissions }) {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionName[]>(user.permissions);

  const handlePermission = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const value = event.target.value as PermissionName;

    setPermissions((currentPermissions) => {
      if (checked) {
        return currentPermissions.includes(value) ? currentPermissions : [...currentPermissions, value];
      }

      return currentPermissions.filter((permission) => permission !== value);
    });
  };

  const savePermissions = async () => {
    try {
      setError(null);
      setLoading(true);
      const updatedUser = await updateUserPermissions(user.id, { permissions });
      setPermissions(updatedUser.permissions);
      onSaved(updatedUser);
    } catch (nextError) {
      setError(nextError as Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {error ? (
        <tr>
          <td colSpan={9}>
            <ErrorMessage error={error} />
          </td>
        </tr>
      ) : null}
      <tr>
        <td>{user.name}</td>
        <td>{user.email}</td>
        {POSSIBLE_PERMISSIONS.map((permission) => (
          <td key={`${user.id}-${permission}`}>
            <label htmlFor={`${user.id}-permission-${permission}`}>
              <input
                type="checkbox"
                id={`${user.id}-permission-${permission}`}
                checked={permissions.includes(permission)}
                value={permission}
                onChange={handlePermission}
              />
            </label>
          </td>
        ))}
        <td>
          <button type="button" disabled={loading} onClick={savePermissions}>
            Updat{loading ? 'ing' : 'e'}
          </button>
        </td>
      </tr>
    </>
  );
}
