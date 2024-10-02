'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const Redirect = () => {
  const searchParams = useSearchParams();

  const redirect = searchParams.get('redirect') ?? '/';

  useEffect(() => {
    location.href = redirect;
  }, [redirect]);

  if (redirect) {
    return (
      <h3>
        Redirecting to{' '}
        <code>
          <a href={redirect}>{redirect}</a>
        </code>
      </h3>
    );
  }
};
