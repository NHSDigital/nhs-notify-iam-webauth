'use client';

import { Button } from 'nhsuk-react-components';
import { signOut } from '@aws-amplify/auth';

export default function Logout() {

  async function handleSignOut() {
    await signOut();
    location.href = '/';
  }

  return <Button onClick={handleSignOut}>Sign out</Button>;
}
