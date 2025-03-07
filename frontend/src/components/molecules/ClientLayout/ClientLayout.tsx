'use client';

import '@aws-amplify/ui-react/styles.css';
import { Amplify } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { NHSNotifyContainer } from '@/src/components/layouts/container/container';
import amplifyConfig from '@/amplify_outputs.json';
import { NHSNotifyHeader } from '../Header/Header';
import { NHSNotifyFooter } from '../Footer/Footer';

// eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module, import/no-unresolved
Amplify.configure(amplifyConfig, { ssr: true });

export const ClientLayout = ({ children }: { children: React.ReactNode }) => (
  <Authenticator.Provider>
    <NHSNotifyHeader />
    <NHSNotifyContainer>{children}</NHSNotifyContainer>
    <NHSNotifyFooter />
  </Authenticator.Provider>
);
