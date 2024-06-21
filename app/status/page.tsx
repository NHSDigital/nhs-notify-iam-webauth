import React from 'react';
import { AuthGetCurrentUserServer } from '../../utils/amplify-utils';

export default async function Page({ searchParams }: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {

  const { currentUser, attributes } = await AuthGetCurrentUserServer() ?? {};
  const redirectPath = [searchParams.redirect].flat().pop() || '/';

  return <>
    <h1>Hello {currentUser?.username}</h1>
    <h2>Login details</h2>
    <pre>{JSON.stringify(currentUser?.signInDetails, null, '  ')}</pre>
    <h2>Attributes</h2>
    <pre>{JSON.stringify(attributes, null, '  ')}</pre>
    <h2>Redirect details</h2>
    <pre>{JSON.stringify({ redirectPath })}</pre>
  </>
}
