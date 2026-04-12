'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import StateMessage from './StateMessage';
import SignIn from './SignIn';
import SignUp from './SignUp';
import User from './User';

export default function PleaseSignIn({ children }: { children: ReactNode }) {
  return (
    <User>
      {({ data, loading }) => {
        if (loading) {
          return (
            <StateMessage
              title="Checking your account"
              description="Confirming your session before showing this part of the storefront."
              tone="muted"
            />
          );
        }

        if (!data.me) {
          return (
            <motion.div
              className="grid gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <StateMessage
                title="Please sign in to continue"
                description="This page is only available to signed-in customers. Sign in with an existing account or create one below."
              />
              <SignIn />
              <motion.div
                className="px-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="m-0 text-[2rem] font-semibold tracking-[-0.03em] text-[var(--color-text)]">
                  Need an account?
                </h3>
              </motion.div>
              <SignUp />
            </motion.div>
          );
        }

        return children;
      }}
    </User>
  );
}