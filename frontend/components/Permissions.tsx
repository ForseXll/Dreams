'use client';

import { useEffect, useState } from 'react';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import type { PermissionName, UserWithPermissions } from '../lib/api/types';
import {
  metaLabelClass,
  mutedSurfaceClass,
  panelClass,
  primaryButtonClass,
  sectionDescriptionClass,
  sectionHeaderClass,
  sectionTitleClass,
  statCardClass,
} from '../lib/ui';
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
    return (
      <StateMessage
        title="Loading permissions"
        description="Fetching users and their current permission assignments."
        tone="muted"
      />
    );
  }

  return (
    <section className="grid gap-6">
      <ErrorMessage error={error || undefined} />
      <div className={sectionHeaderClass}>
        <div className="space-y-2">
          <h1 className={sectionTitleClass}>Permissions</h1>
          <p className={sectionDescriptionClass}>
            Review account access and save permission changes for each user individually.
          </p>
        </div>
        <div className={`${statCardClass} lg:justify-self-end`}>
          <span className="font-semibold text-[var(--color-text)]">{users.length}</span> managed user{users.length === 1 ? '' : 's'}
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <div className={mutedSurfaceClass}>
          <p className={metaLabelClass}>Who can edit items</p>
          <p className="mt-2 mb-0 text-[1.45rem] text-[var(--color-text)]">Item create, update, and delete permissions control catalog access.</p>
        </div>
        <div className={mutedSurfaceClass}>
          <p className={metaLabelClass}>Who can manage access</p>
          <p className="mt-2 mb-0 text-[1.45rem] text-[var(--color-text)]">Permission update and admin access allow permission changes.</p>
        </div>
        <div className={mutedSurfaceClass}>
          <p className={metaLabelClass}>Save behavior</p>
          <p className="mt-2 mb-0 text-[1.45rem] text-[var(--color-text)]">Changes stay local until you press Save for that row.</p>
        </div>
      </div>
      <div className={`${panelClass} overflow-hidden p-0`}>
        <div className="overflow-x-auto rounded-[10px]">
          <table className="min-w-[760px] w-full border-spacing-0">
            <thead>
              <tr className="bg-[var(--color-surface-alt)]">
                <th className="border-r border-b border-[var(--color-border)] px-4 py-3 text-left text-[1.15rem] font-semibold text-[var(--color-muted)]">Name</th>
                <th className="border-r border-b border-[var(--color-border)] px-4 py-3 text-left text-[1.15rem] font-semibold text-[var(--color-muted)]">Email</th>
                {POSSIBLE_PERMISSIONS.map((permission) => (
                  <th className="border-r border-b border-[var(--color-border)] px-4 py-3 text-left text-[1.15rem] font-semibold text-[var(--color-muted)]" key={permission}>
                    {permission}
                  </th>
                ))}
                <th className="border-b border-[var(--color-border)] px-4 py-3 text-left text-[1.15rem] font-semibold text-[var(--color-muted)]">Update</th>
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
    </section>
  );
}

function UserPermissions({ onSaved, user }: { onSaved: (user: UserWithPermissions) => void; user: UserWithPermissions }) {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const [permissions, setPermissions] = useState<PermissionName[]>(user.permissions);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const isDirty =
    permissions.length !== user.permissions.length ||
    permissions.some((permission) => !user.permissions.includes(permission));

  const handlePermission = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const value = event.target.value as PermissionName;
    setSaveState('idle');

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
      setSaveState('saved');
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
          <td className="p-3" colSpan={9}>
            <ErrorMessage error={error} />
          </td>
        </tr>
      ) : null}
      <tr className="align-top hover:bg-[var(--color-surface-alt)]/60">
        <td className="border-r border-b border-[var(--color-border)] px-4 py-3 text-[1.35rem] font-semibold text-[var(--color-text)]">
          {user.name}
        </td>
        <td className="border-r border-b border-[var(--color-border)] px-4 py-3 text-[1.35rem] text-[var(--color-muted)]">
          {user.email}
        </td>
        {POSSIBLE_PERMISSIONS.map((permission) => (
          <td className="border-r border-b border-[var(--color-border)] px-4 py-3" key={`${user.id}-${permission}`}>
            <label className="flex justify-center" htmlFor={`${user.id}-permission-${permission}`}>
              <input
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-text)] accent-[var(--color-text)]"
                type="checkbox"
                id={`${user.id}-permission-${permission}`}
                checked={permissions.includes(permission)}
                value={permission}
                onChange={handlePermission}
              />
            </label>
          </td>
        ))}
        <td className="border-b border-[var(--color-border)] px-4 py-3">
          <div className="grid gap-2">
            <button className={primaryButtonClass} type="button" disabled={loading || !isDirty} onClick={savePermissions}>
              {loading ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
            </button>
            <span className="text-[1.15rem] text-[var(--color-muted)]">
              {loading ? 'Updating access' : saveState === 'saved' ? 'Saved' : isDirty ? 'Unsaved changes' : 'No changes'}
            </span>
          </div>
        </td>
      </tr>
    </>
  );
}
