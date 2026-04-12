'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorMessage from './ErrorMessage';
import StateMessage from './StateMessage';
import type { PermissionName, UserWithPermissions } from '../lib/api/types';
import {
  buttonVariants,
  cardVariants,
  typographyClasses,
  cn,
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
    <motion.section
      className="grid gap-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <ErrorMessage error={error || undefined} />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="space-y-2">
          <h1 className={typographyClasses.h1}>Permissions</h1>
          <p className={cn(typographyClasses.body, typographyClasses.muted)}>
            Review account access and save permission changes for each user individually.
          </p>
        </div>
        <motion.div
          className={cn(cardVariants({ variant: 'default', size: 'sm' }), 'lg:justify-self-end')}
          whileHover={{ y: -2 }}
          transition={{ duration: 0.2 }}
        >
          <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
            Managed users
          </p>
          <p className={cn('m-0 mt-1 font-semibold', typographyClasses.body)}>
            {users.length} user{users.length === 1 ? '' : 's'}
          </p>
        </motion.div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {[
          {
            title: 'Who can edit items',
            description: 'Item create, update, and delete permissions control catalog access.',
          },
          {
            title: 'Who can manage access',
            description: 'Permission update and admin access allow permission changes.',
          },
          {
            title: 'Save behavior',
            description: 'Changes stay local until you press Save for that row.',
          },
        ].map((card, i) => (
          <motion.div
            key={card.title}
            className={cardVariants({ variant: 'default', size: 'sm' })}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
              {card.title}
            </p>
            <p className={cn('m-0 mt-2', typographyClasses.small)}>
              {card.description}
            </p>
          </motion.div>
        ))}
      </div>
      <div className={cn(cardVariants({ variant: 'default' }), 'overflow-hidden p-0')}>
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-spacing-0">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface-alt)]">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Email</th>
                {POSSIBLE_PERMISSIONS.map((permission) => (
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]" key={permission}>
                    {permission}
                  </th>
                ))}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">Update</th>
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
    </motion.section>
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
      <tr className="align-top border-b border-[var(--color-border)] transition-colors hover:bg-[var(--color-surface-alt)]/60">
        <td className="px-4 py-3 font-semibold text-[var(--color-text)]">
          {user.name}
        </td>
        <td className="px-4 py-3 text-[var(--color-text-muted)]">
          {user.email}
        </td>
        {POSSIBLE_PERMISSIONS.map((permission) => (
          <td className="px-4 py-3 text-center" key={`${user.id}-${permission}`}>
            <label className="flex cursor-pointer justify-center" htmlFor={`${user.id}-permission-${permission}`}>
              <input
                className="h-4 w-4 rounded border-[var(--color-border)] text-[var(--color-accent)] accent-[var(--color-accent)] transition-colors"
                type="checkbox"
                id={`${user.id}-permission-${permission}`}
                checked={permissions.includes(permission)}
                value={permission}
                onChange={handlePermission}
              />
            </label>
          </td>
        ))}
        <td className="px-4 py-3">
          <div className="flex flex-col gap-2">
            <motion.button
              className={cn(buttonVariants({ variant: isDirty ? 'primary' : 'secondary', size: 'sm' }))}
              type="button"
              disabled={loading || !isDirty}
              onClick={savePermissions}
              whileHover={{ scale: isDirty ? 1.02 : 1 }}
              whileTap={{ scale: isDirty ? 0.98 : 1 }}
            >
              {loading ? 'Saving...' : isDirty ? 'Save' : 'Saved'}
            </motion.button>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.span
                  className={cn(typographyClasses.small, typographyClasses.muted)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Updating access
                </motion.span>
              ) : saveState === 'saved' ? (
                <motion.span
                  className={cn(typographyClasses.small, 'text-[var(--color-success)]')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Saved
                </motion.span>
              ) : isDirty ? (
                <motion.span
                  className={cn(typographyClasses.small, 'text-[var(--color-warning)]')}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Unsaved changes
                </motion.span>
              ) : (
                <span className={cn(typographyClasses.small, typographyClasses.muted)}>
                  No changes
                </span>
              )}
            </AnimatePresence>
          </div>
        </td>
      </tr>
    </>
  );
}