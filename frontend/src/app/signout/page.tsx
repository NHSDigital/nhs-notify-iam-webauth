import React from 'react';
import SignOut from '@/components/molecules/SignOut/SignOut';
import content from '@/content/content';
import { Metadata } from 'next';

const {
  pages: { signOutPage },
} = content;

const { title, ...pageMetadata } = signOutPage.meta;

export const metadata: Metadata = { title, ...pageMetadata };

export default function SignOutPage() {
  return (
    <SignOut>
      <h1>{signOutPage.content}</h1>
    </SignOut>
  );
}
