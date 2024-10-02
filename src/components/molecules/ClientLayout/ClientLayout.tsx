/* eslint-disable @typescript-eslint/no-var-requires,unicorn/prefer-module */

'use client';

// import styles
import '@/src/styles/app.scss';
import '@aws-amplify/ui-react/styles.css';

import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import content from '@/src/content/content';
import Head from 'next/head';
import { NHSNotifyHeader } from '../Header/Header';
import { NHSNotifyContainer } from '../../layouts/container/container';
import { NHSNotifyFooter } from '../Footer/Footer';

Amplify.configure(require('@/amplify_outputs.json'), { ssr: true });

export const ClientLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang='en'>
    <Head>
      <script src={`${process.env.basePath}/lib/nhsuk-8.1.1.min.js`} defer />
      <title>{content.global.mainLayout.title}</title>
      <link
        rel='shortcut icon'
        href={`${process.env.basePath}/lib/assets/favicons/favicon.ico`}
        type='image/x-icon'
      />
      <link
        rel='apple-touch-icon'
        href={`${process.env.basePath}/lib/assets/favicons/apple-touch-icon-180x180.png`}
      />
      <link
        rel='mask-icon'
        href={`${process.env.basePath}/lib/assets/favicons/favicon.svg`}
        color='#005eb8'
      />
      <link
        rel='icon'
        sizes='192x192'
        href={`${process.env.basePath}/lib/assets/favicons/favicon-192x192.png`}
      />
      <meta
        name='msapplication-TileImage'
        content={`${process.env.basePath}/lib/assets/favicons/mediumtile-144x144.png`}
      />
      <meta name='msapplication-TileColor' content='#005eb8' />
      <meta
        name='msapplication-square70x70logo'
        content={`${process.env.basePath}/lib/assets/favicons/smalltile-70x70.png`}
      />
      <meta
        name='msapplication-square150x150logo'
        content={`${process.env.basePath}/lib/assets/favicons/mediumtile-150x150.png`}
      />
      <meta
        name='msapplication-wide310x150logo'
        content={`${process.env.basePath}/lib/assets/favicons/widetile-310x150.png`}
      />
      <meta
        name='msapplication-square310x310logo'
        content={`${process.env.basePath}/lib/assets/favicons/largetile-310x310.png`}
      />
    </Head>
    <body suppressHydrationWarning>
      <script
        type='text/javascript'
        src={`${process.env.basePath}/lib/nhs-frontend-js-check.js`}
        defer
      />
      <Authenticator.Provider>
        <NHSNotifyHeader />
        <NHSNotifyContainer>{children}</NHSNotifyContainer>
        <NHSNotifyFooter />
      </Authenticator.Provider>
    </body>
  </html>
);
