'use client';

import { useRouter } from 'next/navigation';
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
import StateMessage from './StateMessage';
import User from './User';

export default function Account() {
  const router = useRouter();

  return (
    <User>
      {({ data, loading }) => {
        if (loading) {
          return (
            <StateMessage
              title="Loading account"
              description="Pulling your account details and permission settings."
              tone="muted"
            />
          );
        }

        if (!data.me) {
          return (
            <StateMessage
              title="You need to sign in"
              description="Account details are only available once you are signed into the storefront."
            />
          );
        }

        const permissions = data.me.permissions;
        const canManagePermissions =
          permissions.includes('ADMIN') || permissions.includes('PERMISSIONUPDATE');

        return (
          <section className="grid gap-6">
            <div className={sectionHeaderClass}>
              <div className="space-y-2">
                <h1 className={sectionTitleClass}>Account</h1>
                <p className={sectionDescriptionClass}>
                  Review your current account details, storefront access, and available administrative actions.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:justify-self-end">
                <div className={statCardClass}>
                  Signed in as <span className="font-semibold text-[var(--color-text)]">{data.me.name}</span>
                </div>
                <div className={statCardClass}>
                  <span className="font-semibold text-[var(--color-text)]">{permissions.length || 1}</span> permission set
                </div>
              </div>
            </div>

            <div className={`${panelClass} grid gap-5 p-5 sm:p-6`}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className={mutedSurfaceClass}>
                  <p className={metaLabelClass}>Name</p>
                  <p className="mt-2 mb-0 text-[1.8rem] font-semibold">{data.me.name}</p>
                </div>
                <div className={mutedSurfaceClass}>
                  <p className={metaLabelClass}>Email</p>
                  <p className="mt-2 mb-0 break-all text-[1.6rem] font-semibold">{data.me.email}</p>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--color-border)] px-4 py-4">
                <p className={metaLabelClass}>Permissions</p>
                <p className="mt-2 mb-0 text-[1.5rem] leading-[1.7] text-[var(--color-text)]">
                  {permissions.join(', ') || 'USER'}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className={`${primaryButtonClass} w-fit`}
                  onClick={() => {
                    if (!canManagePermissions) {
                      window.alert('You do not have access to manage permissions.');
                      return;
                    }

                    router.push('/permissions');
                  }}
                >
                  Open Permissions
                </button>
                {!canManagePermissions ? (
                  <p className="m-0 self-center text-[1.35rem] text-[var(--color-muted)]">
                    Ask an administrator if you need additional access.
                  </p>
                ) : null}
              </div>
            </div>
          </section>
        );
      }}
    </User>
  );
}
