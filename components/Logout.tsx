'use client';

import { Button } from 'nhsuk-react-components';
import { signOut } from '@aws-amplify/auth';

export default function Logout() {
  const handleSignOut = async () => {
    await signOut();
    location.href = '/';
  };

  return <Button onClick={handleSignOut}>Sign out</Button>;
}
