'use client';

import React from 'react';
import { Button } from 'nhsuk-react-components';
import { SignOut } from '@/src/components/molecules/SignOut/SignOut';
import { getConstants } from '@/src/utils/public-constants';
import { useSearchParams } from 'next/navigation';
import content from '@/src/content/content';

export default function InactivePage() {
  const { BASE_PATH } = getConstants();

  const searchParams = useSearchParams().toString();

  const signLinLink = BASE_PATH + (searchParams ? `?${searchParams}` : '');

  const {
    pages: { inactivePage },
  } = content;

  const paragraphs = inactivePage.body.map((paragraph, index) => {
    const key = `inactive-paragraph-${index}`;

    return <p key={key}>{paragraph}</p>;
  });

  return (
    <SignOut>
      <div className='nhsuk-grid-row'>
        <h1>{inactivePage.pageHeading}</h1>
        {paragraphs}
        <Button href={signLinLink}>{inactivePage.signInText}</Button>
      </div>
    </SignOut>
  );
}
