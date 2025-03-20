import React from 'react';
import { Metadata } from 'next';
import content from '@/src/content/content';
import Inactive from './Inactive';

const {
  pages: {
    inactivePage: { meta },
  },
} = content;

export const metadata: Metadata = {
  ...meta,
};

export default function InactivePage() {
  return <Inactive />;
}
