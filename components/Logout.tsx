'use client';

import { useAuthenticator } from '@aws-amplify/ui-react';
import { Button } from 'nhsuk-react-components';

export default function Logout() {
  const { authStatus, signOut } = useAuthenticator();

  async function handleSignOut() {
    signOut();
    location.href = '/';
  }

  return <Button onClick={handleSignOut}>Sign out</Button>;
}
