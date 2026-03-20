'use client';

import type { ReactNode } from 'react';
import SignIn from './SignIn';
import SignUp from './SignUp';
import User from './User';

export default function PleaseSignIn({ children }: { children: ReactNode }) {
  return (
    <User>
      {({ data, loading }) => {
        if (loading) {
          return <p>Loading...</p>;
        }

        if (!data.me) {
          return (
            <div>
              <h3>Please sign in before continuing.</h3>
              <SignIn />
              <h3>Or create an account first.</h3>
              <SignUp />
            </div>
          );
        }

        return children;
      }}
    </User>
  );
}
