import React from 'react';
import { redirect } from 'next/navigation';
import { AuthGetCurrentUserServer } from '../../utils/amplify-utils';
import Logout from '../../components/Logout';

export default async function Page() {
  const { currentUser, idToken } = (await AuthGetCurrentUserServer()) ?? {};
  if (!currentUser) {
    redirect('/');
  }

  return (
    <>
      <h1>Sign out</h1>
      <p>
        You are currently logged in as{' '}
        <strong>{idToken?.email?.toString()}</strong>
      </p>
      <Logout />
    </>
  );
}