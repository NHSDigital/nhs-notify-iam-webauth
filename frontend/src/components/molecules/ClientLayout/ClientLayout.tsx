'use client';

import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import NHSNotifyContainer from '@/components/layouts/container/container';
import NHSNotifyHeader from '@/components/molecules/Header/Header';
import NHSNotifyFooter from '@/components/molecules/Footer/Footer';

// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import-x/no-unresolved, import-x/no-unresolved
const amplifyConfig = require('@amplify_outputs');

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
