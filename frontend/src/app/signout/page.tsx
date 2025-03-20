import React from 'react';
import { Metadata } from 'next';
import { SignOut } from '@/src/components/molecules/SignOut/SignOut';
import content from '@/src/content/content';

const {
  pages: { signOutPage },
} = content;

export const metadata: Metadata = {
  ...signOutPage.meta,
};

export default function Page() {
  return (
    <SignOut>
      <h1>{signOutPage.content}</h1>
    </SignOut>
  );
}
