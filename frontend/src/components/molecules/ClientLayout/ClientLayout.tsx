'use client';

import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { NHSNotifyContainer } from '@/src/components/layouts/container/container';
// eslint-disable-next-line import-x/no-unresolved
import amplifyConfig from '@/amplify_outputs.json';
import { NHSNotifyHeader } from '../Header/Header';
import { NHSNotifyFooter } from '../Footer/Footer';

Amplify.configure(amplifyConfig, { ssr: true });

export function ClientLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <Authenticator.Provider>
      <NHSNotifyHeader />
      <NHSNotifyContainer>{children}</NHSNotifyContainer>
      <NHSNotifyFooter />
    </Authenticator.Provider>
  );
}
