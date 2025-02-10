'use client';

import React from 'react';
import { Redirect } from '@/src/components/molecules/Redirect/Redirect';
import { SignOut } from '@/src/components/molecules/SignOut/SignOut';

export default function Page() {
  return (
    <SignOut>
      <Redirect />
    </SignOut>
  );
}
