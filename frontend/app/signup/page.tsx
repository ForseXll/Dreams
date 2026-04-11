'use client';

import RequestReset from '../../components/RequestReset';
import SignIn from '../../components/SignIn';
import SignUp from '../../components/SignUp';

export default function SignupPage() {
  return (
    <div className="grid gap-5 md:grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
      <SignUp />
      <SignIn />
      <RequestReset />
    </div>
  );
}
