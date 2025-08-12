import React from 'react';
import { render, screen } from '@testing-library/react';
import MarkdownContent from '@/components/MarkdownContent/MarkdownContent';

describe('MarkdownContent', () => {
  it('renders nothing if content is empty array', () => {
    const { container } = render(<MarkdownContent content={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing if content is empty string', () => {
    const { container } = render(<MarkdownContent content='' />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders content if content is a string', () => {
    render(
      <MarkdownContent
        content='This is content with a [link](www.link.com).'
        testId='testid'
      />
    );
    expect(
      screen.getByText('This is content with a', { exact: false })
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', 'www.link.com');
    expect(screen.getByRole('link')).toHaveTextContent('link');
  });

  it('passes ID through if content is a string', () => {
    render(<MarkdownContent content='This is content' id='content-id' />);
    expect(screen.getByText('This is content')).toHaveAttribute(
      'id',
      'content-id-0'
    );
  });

  it('renders multiple segments in correct order', () => {
    const segments = ['First paragraph', 'Second [link](https://example.com)'];

    render(<MarkdownContent content={segments} />);

    expect(screen.getByText('First paragraph')).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute(
      'href',
      'https://example.com'
    );
    expect(screen.getByRole('link')).toHaveTextContent('link');
  });

  it('passes indexed IDs to each item if content is an array', () => {
    render(
      <MarkdownContent
        content={['First paragraph', 'Second paragraph']}
        id='content-id'
      />
    );

    const first = screen.getByText('First paragraph');
    expect(first).toHaveAttribute('id', 'content-id-0');

    const second = screen.getByText('Second paragraph');
    expect(second).toHaveAttribute('id', 'content-id-1');
  });

  it('adds correct attributes to links', () => {
    const segments = ['Click [here](https://example.com)'];

    render(<MarkdownContent content={segments} />);

    const link = screen.getByRole('link', { name: 'here' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders markdown paragraphs and links correctly (snapshot)', () => {
    const segments = [
      'This is a paragraph',
      'Here is a [link](https://example.com)',
    ];

    const container = render(<MarkdownContent content={segments} />);
    expect(container.asFragment()).toMatchSnapshot();
  });

  it('renders interpolated variables correctly', () => {
    render(
      <MarkdownContent
        content={[
          'Welcome {{name}}, you have {{count}} {{count|message|messages}}.',
          '[Click here](https://example.com)',
        ]}
        variables={{ name: 'Test', count: 2 }}
      />
    );

    expect(
      screen.getByText('Welcome Test, you have 2 messages.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Click here' })).toHaveAttribute(
      'href',
      'https://example.com'
    );
  });

  it('escapes dangerous HTML, scripts, and iframes', () => {
    const segments = [
      '<script>alert("hacked!")</script>',
      '<img src=x onerror=alert(1)>',
      '<iframe src="https://malicious-site.com"></iframe>',
    ];

    const { container } = render(<MarkdownContent content={segments} />);

    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('iframe')).toBeNull();
  });
});
