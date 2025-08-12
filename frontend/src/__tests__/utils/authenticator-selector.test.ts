import { mockDeep } from 'jest-mock-extended';
import type { AuthenticatorServiceFacade } from '@aws-amplify/ui';
import { authenticatorSelector } from '@/utils/authenticator-selector';

test('authenticatorSelector', () => {
  const mockAuthContext = mockDeep<AuthenticatorServiceFacade>({
    authStatus: 'authenticated',
    error: 'err',
  });

  expect(authenticatorSelector(mockAuthContext)).toEqual([
    'authenticated',
    'err',
  ]);
});
