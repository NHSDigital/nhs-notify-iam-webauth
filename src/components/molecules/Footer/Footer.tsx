import content from '@/src/content/content';

const footerContent = content.components.footer;

export function NHSNotifyFooter() {
  return (
    <footer role='contentinfo' data-testid='page-footer'>
      <div className='nhsuk-footer-container'>
        <div className='nhsuk-width-container'>
          <h1 className='nhsuk-u-visually-hidden' data-testid='support-links'>
            {footerContent.supportLinks}
          </h1>
          <div className='nhsuk-footer'>
            <ul className='nhsuk-footer__list' data-testid='footer-links'>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <a
                  className='nhsuk-footer__list-item-link'
                  href={footerContent.links.acceptableUsePolicy.url}
                  data-testid='acceptable-use-policy-statement-link'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {footerContent.links.acceptableUsePolicy.text}
                </a>
              </li>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <a
                  className='nhsuk-footer__list-item-link'
                  href={footerContent.links.accessibilityStatement.url}
                  data-testid='accessibility-statement-link'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {footerContent.links.accessibilityStatement.text}
                </a>
              </li>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <a
                  className='nhsuk-footer__list-item-link'
                  href={footerContent.links.cookies.url}
                  data-testid='cookies-statement-link'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {footerContent.links.cookies.text}
                </a>
              </li>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <a
                  className='nhsuk-footer__list-item-link'
                  href={footerContent.links.privacy.url}
                  data-testid='privacy-statement-link'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {footerContent.links.privacy.text}
                </a>
              </li>
              <li className='nhsuk-footer__list-item nhsuk-footer-default__list-item'>
                <a
                  className='nhsuk-footer__list-item-link'
                  href={footerContent.links.termsAndConditions.url}
                  data-testid='terms-and-conditions-statement-link'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  {footerContent.links.termsAndConditions.text}
                </a>
              </li>
            </ul>
            <p
              className='nhsuk-footer__copyright'
              data-testid='nhs-england-copyright-text'
            >
              &copy; {footerContent.nhsEngland}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
