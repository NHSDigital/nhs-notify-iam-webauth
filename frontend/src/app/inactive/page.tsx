import React from 'react';
import { Metadata } from 'next';
import content from '@/content/content';
import Inactive from '@/app/inactive/Inactive';

const {
  pages: { inactivePage },
} = content;

const { title, ...pageMetadata } = inactivePage.meta;

export const metadata: Metadata = pageMetadata;

export default function InactivePage() {
  return (
    <>
      <head>
        <title>{title}</title>
      </head>
      <Inactive />
    </>
  );
}
