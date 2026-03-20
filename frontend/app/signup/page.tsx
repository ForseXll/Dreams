'use client';

import styled from 'styled-components';
import RequestReset from '../../components/RequestReset';
import SignIn from '../../components/SignIn';
import SignUp from '../../components/SignUp';

const Columns = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  grid-gap: 20px;
`;

export default function SignupPage() {
  return (
    <Columns>
      <SignUp />
      <SignIn />
      <RequestReset />
    </Columns>
  );
}
