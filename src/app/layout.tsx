import type { Metadata } from 'next';
import '@/src/styles/app.scss';
import content from '@/src/content/content';
import { NHSNotifyHeader } from '../components/molecules/Header/Header';
import { NHSNotifyContainer } from '../components/layouts/container/container';
import { NHSNotifyFooter } from '../components/molecules/Footer/Footer';

export const metadata: Metadata = {
  title: content.global.mainLayout.title,
  description: content.global.mainLayout.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <head>
        <script src='/auth/lib/nhsuk-8.1.1.min.js' defer />
        <title>{content.global.mainLayout.title}</title>
        <link
          rel='shortcut icon'
          href='/auth/lib/assets/favicons/favicon.ico'
          type='image/x-icon'
        />
        <link
          rel='apple-touch-icon'
          href='/auth/lib/assets/favicons/apple-touch-icon-180x180.png'
        />
        <link
          rel='mask-icon'
          href='/auth/lib/assets/favicons/favicon.svg'
          color='#005eb8'
        />
        <link
          rel='icon'
          sizes='192x192'
          href='/auth/lib/assets/favicons/favicon-192x192.png'
        />
        <meta
          name='msapplication-TileImage'
          content='/auth/lib/assets/favicons/mediumtile-144x144.png'
        />
        <meta name='msapplication-TileColor' content='#005eb8' />
        <meta
          name='msapplication-square70x70logo'
          content='/auth/lib/assets/favicons/smalltile-70x70.png'
        />
        <meta
          name='msapplication-square150x150logo'
          content='/auth/lib/assets/favicons/mediumtile-150x150.png'
        />
        <meta
          name='msapplication-wide310x150logo'
          content='/auth/lib/assets/favicons/widetile-310x150.png'
        />
        <meta
          name='msapplication-square310x310logo'
          content='/auth/lib/assets/favicons/largetile-310x310.png'
        />
      </head>
      <body suppressHydrationWarning>
        <script
          type='text/javascript'
          src='/auth/lib/nhs-frontend-js-check.js'
          defer
        />
        <NHSNotifyHeader />
        <NHSNotifyContainer>
          miho6
          {children}
        </NHSNotifyContainer>
        <NHSNotifyFooter />
      </body>
    </html>
  );
}
