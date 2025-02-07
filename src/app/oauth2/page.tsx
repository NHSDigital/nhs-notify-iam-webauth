import { type ReactNode, useEffect } from 'react';
import path from 'path';
import { redirect, RedirectType } from 'next/navigation';
import { Hub } from 'aws-amplify/utils';
import type { State } from '@/src/utils/federated-sign-in';

export default function CIS2CallbackPage(): ReactNode {
  useEffect(() => {
    return Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'customOAuthState') {
        const customState: State = JSON.parse(payload.data);
        redirect(
          path.normalize(`/redirect/${customState.redirectPath || '/home'}`),
          RedirectType.replace
        );
      }
    });
  }, []);

  return undefined;
}
