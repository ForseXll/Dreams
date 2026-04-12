'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  badgeVariants,
  buttonVariants,
  cardVariants,
  typographyClasses,
  cn,
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
          <motion.section
            className="grid gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
              <div className="space-y-2">
                <h1 className={typographyClasses.h1}>Account</h1>
                <p className={cn(typographyClasses.body, typographyClasses.muted)}>
                  Review your current account details, storefront access, and available administrative actions.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:justify-self-end">
                <motion.div
                  className={cardVariants({ variant: 'default', size: 'sm' })}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
                    Signed in as
                  </p>
                  <p className={cn('m-0 mt-1 font-semibold', typographyClasses.body)}>
                    {data.me.name}
                  </p>
                </motion.div>
                <motion.div
                  className={cardVariants({ variant: 'default', size: 'sm' })}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
                    Permission sets
                  </p>
                  <p className={cn('m-0 mt-1 font-semibold', typographyClasses.body)}>
                    {permissions.length || 1}
                  </p>
                </motion.div>
              </div>
            </div>

            <div className={cn(cardVariants({ variant: 'default' }), 'grid gap-5 p-5 sm:p-6')}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-4">
                  <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
                    Name
                  </p>
                  <p className={cn('m-0 mt-2 font-semibold', typographyClasses.h4)}>
                    {data.me.name}
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-alt)] px-4 py-4">
                  <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
                    Email
                  </p>
                  <p className={cn('m-0 mt-2 font-semibold', typographyClasses.h4, 'break-all')}>
                    {data.me.email}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-[var(--color-border)] px-4 py-4">
                <p className={cn(typographyClasses.small, typographyClasses.muted, 'm-0 text-xs font-semibold uppercase tracking-wider')}>
                  Permissions
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {permissions.map((permission: string) => (
                    <span key={permission} className={badgeVariants({ variant: 'default' })}>
                      {permission}
                    </span>
                  ))}
                  {permissions.length === 0 && (
                    <span className={badgeVariants({ variant: 'default' })}>USER</span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  className={buttonVariants({ variant: 'primary' })}
                  onClick={() => {
                    if (!canManagePermissions) {
                      return;
                    }
                    router.push('/permissions');
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  disabled={!canManagePermissions}
                >
                  <span className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    Open Permissions
                  </span>
                </motion.button>
                {!canManagePermissions ? (
                  <p className={cn('m-0', typographyClasses.small, typographyClasses.muted)}>
                    Ask an administrator if you need additional access.
                  </p>
                ) : null}
              </div>
            </div>
          </motion.section>
        );
      }}
    </User>
  );
}