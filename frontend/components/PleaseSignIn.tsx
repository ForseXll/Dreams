'use client';

import type { ReactNode } from 'react';
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
            <div className="grid gap-6">
              <StateMessage
                title="Please sign in to continue"
                description="This page is only available to signed-in customers. Sign in with an existing account or create one below."
              />
              <SignIn />
              <div className="px-1">
                <h3 className="m-0 text-[2rem] font-semibold tracking-[-0.03em]">Need an account?</h3>
              </div>
              <SignUp />
            </div>
          );
        }

        return children;
      }}
    </User>
  );
}
