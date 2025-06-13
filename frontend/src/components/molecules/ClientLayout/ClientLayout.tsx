'use client';

import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import amplifyConfig from '@amplify_outputs';
import NHSNotifyContainer from '@/components/layouts/container/container';
import NHSNotifyHeader from '@/components/molecules/Header/Header';
import NHSNotifyFooter from '@/components/molecules/Footer/Footer';

Amplify.configure(amplifyConfig, { ssr: true });

export default function ClientLayout({
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
