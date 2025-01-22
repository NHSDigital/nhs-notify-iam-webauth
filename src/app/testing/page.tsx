'use client';

import { AuthSession, fetchAuthSession } from '@aws-amplify/auth';
import React, { useState } from 'react';

export default function Page() {
  const [user, setUser] = useState<AuthSession>();

  fetchAuthSession({ forceRefresh: false }).then((authSession) =>
    setUser(authSession)
  );

  const style = {
    padding: '5px'
  };

  return (
    <ul>
      <li style={style}>{user ? user.tokens?.accessToken.toString(): 'No user'}</li>
      <li style={style}>{user ? user.userSub: 'No user'}</li>
      <li style={style}>{user ? user.identityId: 'No user'}</li>
      <li style={style}>{user ? user.credentials?.accessKeyId: 'No user'}</li>
      <li style={style}>{user ? user.tokens?.idToken?.toString(): 'No user'}</li>
    </ul>
  );
}
