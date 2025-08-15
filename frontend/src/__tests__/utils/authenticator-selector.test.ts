import { mockDeep } from 'jest-mock-extended';
import type { AuthenticatorServiceFacade } from '@aws-amplify/ui';
import { authenticatorSelector } from '@/utils/authenticator-selector';

test('authenticatorSelector', () => {
  const mockAuthContext = mockDeep<AuthenticatorServiceFacade>({
    authStatus: 'unauthenticated',
    error: 'err',
  });

  expect(authenticatorSelector(mockAuthContext)).toEqual([
    'unauthenticated',
    'err',
  ]);
});
