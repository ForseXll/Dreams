'use client';

import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import User from './User';

const AccountPage = styled.div`
    width: ${(props) => props.theme.maxWidth};
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 10px;
    border: 2px solid black;
    padding: 10px;
    margin: 5px;

    button {
        background: teal;
        justify-self: start;
        cursor: pointer;
    }

    .request {
        justify-self: center;
    }
`;

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

        const canManagePermissions =
          data.me.permissions.includes('ADMIN') || data.me.permissions.includes('PERMISSIONUPDATE');

        return (
          <AccountPage>
            <div>
              <h1>Account Info</h1>
            </div>
            <h3>Hello {data.me.name}!</h3>
            <p>Email: {data.me.email}</p>
            <p>Permissions: {data.me.permissions.join(', ') || 'USER'}</p>
            <button
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
            <button className="request" disabled>
              Request Permissions Coming Soon
            </button>
          </AccountPage>
        );
      }}
    </User>
  );
}
