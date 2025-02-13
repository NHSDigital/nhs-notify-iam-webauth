'use client';

import React from 'react';
import { Button } from 'nhsuk-react-components';
import { SignOut } from '@/src/components/molecules/SignOut/SignOut';
import { useSearchParams } from 'next/navigation';
import content from '@/src/content/content';
import { MetaTitle } from '@/src/components/atoms/MetaTitle/MetaTitle';

export default function InactivePage() {
  const {
    pages: { inactivePage },
    components: { headerComponent },
  } = content;

  const searchParams = useSearchParams().toString();

  const signLinLink =
    headerComponent.links.signIn.href +
    (searchParams ? `?${searchParams}` : '');

  const paragraphs = inactivePage.body.map((paragraph, index) => {
    const key = `inactive-paragraph-${index}`;

    return <p key={key}>{paragraph}</p>;
  });

  return (
    <>
      <MetaTitle
        title={inactivePage.meta.title}
        description={inactivePage.meta.description}
      />
      <SignOut>
        <div className='nhsuk-grid-row'>
          <h1>{inactivePage.pageHeading}</h1>
          {paragraphs}
          <Button href={signLinLink}>
            {headerComponent.links.signIn.text}
          </Button>
        </div>
      </SignOut>
    </>
  );
}
