import React from 'react';
import { Metadata } from 'next';
import SignOut from '@/components/molecules/SignOut/SignOut';
import content from '@/content/content';

const {
  pages: { signOutPage },
} = content;

export const metadata: Metadata = {
  ...signOutPage.meta,
};

export default function SignOutPage() {
  return (
    <SignOut>
      <h1>{signOutPage.content}</h1>
    </SignOut>
  );
}
