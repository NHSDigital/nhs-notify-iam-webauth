import Link from 'next/link';
import concatClassNames from '@/src/utils/concat-class-names';
import content from '@/src/content/content';
import styles from './Header.module.scss';
import { HeaderType } from './header.types';
import { LoginStatus } from '../LoginStatus/LoginStatus';

export function NHSNotifyHeader({ className, dataTestId }: HeaderType) {
  return (
    <header
      className='nhsuk-header'
      role='banner'
      data-testid={dataTestId ?? 'page-header'}
    >
      <div className='nhsuk-header__container'>
        <div className='nhsuk-header__logo'>
          <Link
            className='nhsuk-header__link nhsuk-header__link--service'
            href='/'
            aria-label='NHS homepage'
          >
            <svg
              className='nhsuk-logo'
              xmlns='http://www.w3.org/2000/svg'
              viewBox='0 0 40 16'
              height='40'
              width='100'
              data-testid='page-header-logo'
            >
              <path
                className='nhsuk-logo__background'
                fill='#005eb8'
                d='M0 0h40v16H0z'
              />
              <path
                className='nhsuk-logo__text'
                fill='#fff'
                d='M3.9 1.5h4.4l2.6 9h.1l1.8-9h3.3l-2.8 13H9l-2.7-9h-.1l-1.8 9H1.1M17.3 1.5h3.6l-1 4.9h4L25 1.5h3.5l-2.7 13h-3.5l1.1-5.6h-4.1l-1.2 5.6h-3.4M37.7 4.4c-.7-.3-1.6-.6-2.9-.6-1.4 0-2.5.2-2.5 1.3 0 1.8 5.1 1.2 5.1 5.1 0 3.6-3.3 4.5-6.4 4.5-1.3 0-2.9-.3-4-.7l.8-2.7c.7.4 2.1.7 3.2.7s2.8-.2 2.8-1.5c0-2.1-5.1-1.3-5.1-5 0-3.4 2.9-4.4 5.8-4.4 1.6 0 3.1.2 4 .6'
              />
            </svg>
            <span className='nhsuk-header__service-name'>
              {content.components.headerComponent.serviceName}
            </span>
          </Link>
        </div>
        <div
          className={concatClassNames(
            className,
            'nhsuk-header__content',
            styles.header__content
          )}
          id='content-header'
        >
          {/* I am currently testing the link wrapper, this will change later when we implement auth as the link will change based on auth state */}
          {process.env.NEXT_PUBLIC_DISABLE_CONTENT === 'true' ? undefined : (
            <div className='nhsuk-account__login' data-testid='login-link'>
              <LoginStatus />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
