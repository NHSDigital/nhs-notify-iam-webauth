import React from 'react';
import { Metadata } from 'next';
import content from '@/content/content';
import MarkdownContent from '@/components/MarkdownContent/MarkdownContent';

const {
  pages: { requestToBeAddedToClientPage: page },
} = content;

export const metadata: Metadata = {
  ...page.meta,
};

export default function RequestToBeAddedToAServicePage() {
  return (
    <>
      <h1>{page.pageHeading}</h1>
      <h2 className='nhsuk-heading-m'>{page.ifOnboardingSubhead}</h2>
      <MarkdownContent content={page.ifOnboardingPara1Md} />
      <p>{page.ifOnboardingPara2}</p>
      <ul>
        {page.ifOnboardingMessageRequirements.map((req, i) => (
          <li key={i}>{req}</li>
        ))}
      </ul>
      <h2 className='nhsuk-heading-m'>{page.ifExistingSubhead}</h2>
      <MarkdownContent content={page.ifExistingPara1Md} />
    </>
  );
}
