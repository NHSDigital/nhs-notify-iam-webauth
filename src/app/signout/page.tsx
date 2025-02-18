import React from 'react';
import { SignOut } from '@/src/components/molecules/SignOut/SignOut';
import content from '@/src/content/content';
import { Metadata } from 'next';

const {
  pages: { signOutPage },
} = content;

export const metadata: Metadata = {
  ...signOutPage.meta,
};

export default function Page() {
  return (
    <SignOut>
      <p>{signOutPage.content}</p>
    </SignOut>
  );
}
