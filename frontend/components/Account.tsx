'use client';

import { useRouter } from 'next/navigation';
import { panelClass, primaryButtonClass, quietButtonClass } from '../lib/ui';
import User from './User';

export default function Account() {
  const router = useRouter();

  return (
    <User>
      {({ data, loading }) => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (!data.me) {
          return <p>Please sign in to view your account.</p>;
        }

        const permissions = data.me.permissions;
        const canManagePermissions =
          permissions.includes('ADMIN') || permissions.includes('PERMISSIONUPDATE');

        return (
          <div className={`${panelClass} grid gap-3 p-4`}>
            <div>
              <h1 className="m-0 text-[2.8rem] font-bold tracking-[-0.03em]">Account Info</h1>
            </div>
            <h3 className="m-0 text-[2rem] font-semibold">Hello {data.me.name}!</h3>
            <p className="m-0">Email: {data.me.email}</p>
            <p className="m-0">Permissions: {permissions.join(', ') || 'USER'}</p>
            <button
              className={`${primaryButtonClass} w-fit`}
              onClick={() => {
                if (!canManagePermissions) {
                  window.alert("You don't have permission to go there.");
                  return;
                }

                router.push('/permissions');
              }}
            >
              Permissions
            </button>
            <button className={`${quietButtonClass} justify-self-center`} disabled>
              Request Permissions Coming Soon
            </button>
          </div>
        );
      }}
    </User>
  );
}
