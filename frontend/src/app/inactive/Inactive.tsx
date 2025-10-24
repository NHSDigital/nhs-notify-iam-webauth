'use client';

import React from 'react';
import { Button } from 'nhsuk-react-components';
import { useSearchParams } from 'next/navigation';
import SignOut from '@/components/molecules/SignOut/SignOut';
import content from '@/content/content';

export default function Inactive() {
  const {
    components: { header },
    pages: { inactivePage },
  } = content;

  const searchParams = useSearchParams().toString();

  const signInLink =
    header.accountInfo.links.signIn.href +
    (searchParams ? `?${searchParams}` : '');

  const paragraphs = inactivePage.body.map((paragraph, index) => {
    const key = `inactive-paragraph-${index}`;

    return <p key={key}>{paragraph}</p>;
  });

  return (
    <SignOut>
      <h1>{inactivePage.pageHeading}</h1>
      {paragraphs}
      <Button id='inactive-sign-in' href={signInLink}>
        {header.accountInfo.links.signIn.text}
      </Button>
    </SignOut>
  );
}
