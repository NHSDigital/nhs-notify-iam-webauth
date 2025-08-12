import Markdown from 'markdown-to-jsx';
import React from 'react';
import { interpolate } from '@/utils/interpolate';

type MarkdownContentProps = {
  content: string | string[];
  variables?: Record<string, string | number>;
  id?: string;
  testId?: string;
};

export default function MarkdownContent({
  content,
  id,
  testId,
  variables,
}: Readonly<MarkdownContentProps>) {
  const items = Array.isArray(content) ? content : [content];

  return (
    <>
      {items.map((item, index) => (
        <Markdown
          // eslint-disable-next-line react/no-array-index-key
          key={index}
          id={id ? `${id}-${index}` : undefined}
          data-testid={testId ? `${testId}-${index}` : undefined}
          options={{
            forceBlock: true,
            wrapper: React.Fragment,
            disableParsingRawHTML: true,
            overrides: {
              a: {
                component: 'a',
                props: {
                  rel: 'noopener noreferrer',
                  target: '_blank',
                },
              },
            },
          }}
        >
          {interpolate(item, variables)}
        </Markdown>
      ))}
    </>
  );
}
