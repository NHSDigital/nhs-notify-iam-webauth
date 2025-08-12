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
      <h2>{page.ifExistingSubhead}</h2>
      <MarkdownContent content={page.ifOnboardingPara1Md} />
      <p>{page.ifOnboardingPara2}</p>
      <ul>
        {page.ifOnboardingMessageRequirements.map((req, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <li key={i}>{req}</li>
        ))}
      </ul>
      <h2>{page.ifExistingSubhead}</h2>
      <MarkdownContent content={page.ifExistingPara1Md} />
    </>
  );
}
