import { render, screen } from '@testing-library/react';
import NHSNotifyFooter from '@/components/molecules/Footer/Footer';

interface FooterLinkSpec {
  testId: string;
  text: string;
  href: string;
}

const expectedFooterLinks: [string, FooterLinkSpec][] = [
  [
    'acceptable use policy',
    {
      testId: 'acceptable-use-policy-statement-link',
      text: 'Acceptable use policy',
      href: 'https://digital.nhs.uk/services/nhs-notify/acceptable-use-policy',
    },
  ],
  [
    'accessibility statement',
    {
      testId: 'accessibility-statement-link',
      text: 'Accessibility statement',
      href: '/accessibility',
    },
  ],
  [
    'cookies statement',
    {
      testId: 'cookies-statement-link',
      text: 'Cookies',
      href: '/cookies',
    },
  ],
  [
    'privacy statement',
    {
      testId: 'privacy-statement-link',
      text: 'Privacy',
      href: 'https://digital.nhs.uk/services/nhs-notify/transparency-notice',
    },
  ],
  [
    'terms and conditions statement',
    {
      testId: 'terms-and-conditions-statement-link',
      text: 'Terms and conditions',
      href: 'https://digital.nhs.uk/services/nhs-notify/terms-and-conditions',
    },
  ],
];

describe('Footer component', () => {
  test.each(expectedFooterLinks)('Check %s footer link', (_, linkSpec) => {
    render(<NHSNotifyFooter />);

    const link = screen.getByTestId(linkSpec.testId);
    expect(link).toBeInTheDocument();
    expect(link.getAttribute('href')).toBe(linkSpec.href);
    expect(link.textContent).toBe(linkSpec.text);
  });

  it('renders component correctly', () => {
    render(<NHSNotifyFooter />);

    expect(screen.getByTestId('page-footer')).toBeInTheDocument();
    expect(screen.getByTestId('support-links')).toBeInTheDocument();

    const footerListItems = screen
      .getByTestId('footer-links')
      .querySelectorAll('li');
    const footerLinksOrdered = [...footerListItems]
      .map((footerListItem) => footerListItem.querySelectorAll('a').item(0))
      .filter((link) => !!link)
      .map((footerLink) => footerLink.dataset.testid);

    expect(footerLinksOrdered).toEqual(
      expectedFooterLinks.map((linkSpec) => linkSpec[1].testId)
    );
    expect(
      screen.getByTestId('nhs-england-copyright-text')
    ).toBeInTheDocument();
  });
});
