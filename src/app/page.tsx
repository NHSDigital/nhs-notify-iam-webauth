'use client';

import React, { Suspense } from 'react';
import Login from '../components/molecules/Login/Login';

export default function Page() {
  return (
    <Suspense>
      <Login />
    </Suspense>
  );
}
