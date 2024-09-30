'use client';

import React, { Suspense } from 'react';
import Login from '../components/Login';

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
