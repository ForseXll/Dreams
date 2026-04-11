'use client';

import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import type { PermissionName, UserWithPermissions } from '../lib/api/types';
import { primaryButtonClass } from '../lib/ui';
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
        <h2 className="mb-4 text-[2.4rem] font-bold tracking-[-0.03em]">Manage Permissions</h2>
        <div className="overflow-x-auto rounded-[10px] border border-[var(--color-border)] bg-white shadow-[0_4px_12px_rgba(27,24,22,0.08)]">
          <table className="w-full border-spacing-0">
          <thead>
            <tr>
              <th className="border-r border-b border-[var(--color-border)] p-2 text-left text-[1rem] uppercase tracking-[0.08em]">Name</th>
              <th className="border-r border-b border-[var(--color-border)] p-2 text-left text-[1rem] uppercase tracking-[0.08em]">Email</th>
              {POSSIBLE_PERMISSIONS.map((permission) => (
                <th className="border-r border-b border-[var(--color-border)] p-2 text-left text-[1rem] uppercase tracking-[0.08em]" key={permission}>{permission}</th>
              ))}
              <th className="border-b border-[var(--color-border)] p-2 text-left text-[1rem] uppercase tracking-[0.08em]">Update</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <UserPermissions key={user.id} user={user} onSaved={handleSaved} />
            ))}
          </tbody>
          </table>
        </div>
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
          <td className="p-2" colSpan={9}>
            <ErrorMessage error={error} />
          </td>
        </tr>
      ) : null}
      <tr>
        <td className="border-r border-b border-[var(--color-border)] p-2">{user.name}</td>
        <td className="border-r border-b border-[var(--color-border)] p-2">{user.email}</td>
        {POSSIBLE_PERMISSIONS.map((permission) => (
          <td className="border-r border-b border-[var(--color-border)] p-2" key={`${user.id}-${permission}`}>
            <label className="block" htmlFor={`${user.id}-permission-${permission}`}>
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
        <td className="border-b border-[var(--color-border)] p-2">
          <button className={primaryButtonClass} type="button" disabled={loading} onClick={savePermissions}>
            Updat{loading ? 'ing' : 'e'}
          </button>
        </td>
      </tr>
    </>
  );
}
