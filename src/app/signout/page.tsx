'use client';

import React from 'react';
import { SignOut } from '@/src/components/molecules/SignOut/SignOut';
import content from '@/src/content/content';
import { MetaTitle } from '@/src/components/atoms/MetaTitle/MetaTitle';

export default function Page() {
  const {
    pages: { signOutPage },
  } = content;
  return (
    <>
      <MetaTitle
        title={signOutPage.meta.title}
        description={signOutPage.meta.description}
      />
      <SignOut>
        <p>{signOutPage.content}</p>
      </SignOut>
    </>
  );
}
