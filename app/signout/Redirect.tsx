'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export const Redirect = () => {
  const searchParams = useSearchParams();

  console.log(
    'signout searchParams',
    searchParams.get('redirect'),
    searchParams.entries().next()
  );

  const redirect = searchParams.get('redirect') ?? '/';

  useEffect(() => {
    console.log('signout useeffect', redirect);
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
