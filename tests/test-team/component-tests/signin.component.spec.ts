import { randomUUID } from 'node:crypto';
import { test, expect } from '@playwright/test';
import { jwtDecode, type JwtPayload } from 'jwt-decode';
import { CognitoUserHelper, User } from '../helpers/cognito-user-helper';
import { IamWebAuthSignInPage } from '../pages/iam-webauth-signin-page';
import { getCookies } from '../helpers/cookies';

type Scenario =
  | 'no-client'
  | 'client-fully-configured'
  | 'client-not-configured'
  | 'client-no-name'
  | 'client-no-campaign-id';

const scenarios: Record<
  Scenario,
  {
    clientId?: string;
    clientConfig?: { name?: string; campaignId?: string };
  }
> = {
  'no-client': {},
  'client-fully-configured': {
    clientId: randomUUID(),
    clientConfig: { name: randomUUID(), campaignId: randomUUID() },
  },
  'client-not-configured': {
    clientId: randomUUID(),
  },
  'client-no-name': {
    clientId: randomUUID(),
    clientConfig: { campaignId: randomUUID() },
  },
  'client-no-campaign-id': {
    clientId: randomUUID(),
    clientConfig: { name: randomUUID() },
  },
};

type CustomIdTokenClaims = JwtPayload & {
  'nhs-notify:client-id': string;
  'nhs-notify:client-name': string;
  'nhs-notify:campaign-id': string;
};

type CustomAccessTokenClaims = JwtPayload & {
  'nhs-notify:client-id': string;
  'nhs-notify:campaign-id': string;
};

test.describe('SignIn', () => {
  const users: Partial<Record<Scenario, User>> = {};
  const cognitoHelper = new CognitoUserHelper();

  test.beforeAll(async () => {
    await Promise.all(
      Object.entries(scenarios).map(
        async ([scenario, { clientId, clientConfig }]) => {
          const user = await cognitoHelper.createUser(
            `playwright-signIn__${scenario}`
          );
          users[scenario as Scenario] = user;

          if (clientId) {
            await cognitoHelper.createClientGroup(clientId);
            await cognitoHelper.addUserToClientGroup(user.userId, clientId);

            if (clientConfig) {
              await cognitoHelper.configureClient(clientId, clientConfig);
            }
          }
        }
      )
    );
  });

  test.afterAll(async () => {
    await Promise.all(
      Object.entries(scenarios).map(
        async ([scenario, { clientId, clientConfig }]) => {
          if (clientId) {
            await cognitoHelper.deleteClientGroup(clientId);

            if (clientConfig) {
              await cognitoHelper.deleteClientConfig(clientId);
            }
          }

          const user = users[scenario as Scenario];

          if (user) {
            await cognitoHelper.deleteUser(user.userId);
          }
        }
      )
    );
  });

  test.describe('when user is not assigned to a client', () => {
    test('should sign user in with no custom claims in tokens then redirect user to redirect path', async ({
      page,
      baseURL,
    }) => {
      const signInPage = new IamWebAuthSignInPage(page);

      await signInPage.loadPage({
        redirectPath: '/templates/create-and-submit-templates',
      });

      await signInPage.cognitoSignIn(users['no-client']?.email as string);

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-and-submit-templates`
      );

      const cookies = await getCookies(page);

      expect(cookies.csrf_token?.sameSite).toEqual('Strict');
      expect(cookies.csrf_token?.secure).toEqual(true);

      const idToken = jwtDecode<CustomIdTokenClaims>(
        cookies.idToken?.value as string
      );

      expect(idToken['nhs-notify:client-id']).toBeUndefined();
      expect(idToken['nhs-notify:client-name']).toBeUndefined();
      expect(idToken['nhs-notify:campaign-id']).toBeUndefined();

      const accessToken = jwtDecode<CustomAccessTokenClaims>(
        cookies.accessToken?.value as string
      );

      expect(accessToken['nhs-notify:client-id']).toBeUndefined();
      expect(accessToken['nhs-notify:campaign-id']).toBeUndefined();
    });
  });

  test.describe('when user is assigned to an unconfigured client', () => {
    test('should sign user in with only clientId in tokens then redirect user to redirect path', async ({
      page,
      baseURL,
    }) => {
      const signInPage = new IamWebAuthSignInPage(page);

      await signInPage.loadPage({
        redirectPath: '/templates/create-and-submit-templates',
      });

      await signInPage.cognitoSignIn(
        users['client-not-configured']?.email as string
      );

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-and-submit-templates`
      );

      const cookies = await getCookies(page);

      expect(cookies.csrf_token?.sameSite).toEqual('Strict');
      expect(cookies.csrf_token?.secure).toEqual(true);

      const idToken = jwtDecode<CustomIdTokenClaims>(
        cookies.idToken?.value as string
      );

      expect(idToken['nhs-notify:client-id']).toBe(
        scenarios['client-not-configured'].clientId
      );
      expect(idToken['nhs-notify:client-name']).toBeUndefined();
      expect(idToken['nhs-notify:campaign-id']).toBeUndefined();

      const accessToken = jwtDecode<CustomAccessTokenClaims>(
        cookies.accessToken?.value as string
      );

      expect(accessToken['nhs-notify:client-id']).toBe(
        scenarios['client-not-configured'].clientId
      );
      expect(accessToken['nhs-notify:campaign-id']).toBeUndefined();
    });
  });

  test.describe('when user is assigned to a fully configured client', () => {
    test('should sign user in with clientId, name and campaignId in tokens then redirect user to redirect path', async ({
      page,
      baseURL,
    }) => {
      const signInPage = new IamWebAuthSignInPage(page);

      await signInPage.loadPage({
        redirectPath: '/templates/create-and-submit-templates',
      });

      await signInPage.cognitoSignIn(
        users['client-fully-configured']?.email as string
      );

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-and-submit-templates`
      );

      const cookies = await getCookies(page);

      expect(cookies.csrf_token?.sameSite).toEqual('Strict');
      expect(cookies.csrf_token?.secure).toEqual(true);

      const scenario = scenarios['client-fully-configured'];

      const idToken = jwtDecode<CustomIdTokenClaims>(
        cookies.idToken?.value as string
      );

      expect(idToken['nhs-notify:client-id']).not.toBeUndefined();
      expect(idToken['nhs-notify:client-id']).toBe(scenario.clientId);
      expect(idToken['nhs-notify:client-name']).not.toBeUndefined();
      expect(idToken['nhs-notify:client-name']).toBe(
        scenario.clientConfig?.name
      );
      expect(idToken['nhs-notify:campaign-id']).not.toBeUndefined();
      expect(idToken['nhs-notify:campaign-id']).toBe(
        scenario.clientConfig?.campaignId
      );

      const accessToken = jwtDecode<CustomAccessTokenClaims>(
        cookies.accessToken?.value as string
      );

      expect(accessToken['nhs-notify:client-id']).not.toBeUndefined();
      expect(accessToken['nhs-notify:client-id']).toBe(scenario.clientId);
      expect(accessToken['nhs-notify:campaign-id']).not.toBeUndefined();
      expect(accessToken['nhs-notify:campaign-id']).toBe(
        scenario.clientConfig?.campaignId
      );
    });
  });

  test.describe('when user is assigned to a configured client with no campaignId', () => {
    test('should sign user in with no campaignId in tokens then redirect user to redirect path', async ({
      page,
      baseURL,
    }) => {
      const signInPage = new IamWebAuthSignInPage(page);

      await signInPage.loadPage({
        redirectPath: '/templates/create-and-submit-templates',
      });

      await signInPage.cognitoSignIn(
        users['client-no-campaign-id']?.email as string
      );

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-and-submit-templates`
      );

      const cookies = await getCookies(page);

      expect(cookies.csrf_token?.sameSite).toEqual('Strict');
      expect(cookies.csrf_token?.secure).toEqual(true);

      const scenario = scenarios['client-no-campaign-id'];

      const idToken = jwtDecode<CustomIdTokenClaims>(
        cookies.idToken?.value as string
      );

      expect(idToken['nhs-notify:client-id']).not.toBeUndefined();
      expect(idToken['nhs-notify:client-id']).toBe(scenario.clientId);
      expect(idToken['nhs-notify:client-name']).not.toBeUndefined();
      expect(idToken['nhs-notify:client-name']).toBe(
        scenario.clientConfig?.name
      );
      expect(idToken['nhs-notify:campaign-id']).toBeUndefined();

      const accessToken = jwtDecode<CustomAccessTokenClaims>(
        cookies.accessToken?.value as string
      );

      expect(accessToken['nhs-notify:client-id']).not.toBeUndefined();
      expect(accessToken['nhs-notify:client-id']).toBe(scenario.clientId);
      expect(accessToken['nhs-notify:campaign-id']).toBeUndefined();
    });
  });

  test.describe('when user is assigned to a configured client with no name', () => {
    test('should sign user in (no client name in id token) then redirect user to redirect path', async ({
      page,
      baseURL,
    }) => {
      const signInPage = new IamWebAuthSignInPage(page);

      await signInPage.loadPage({
        redirectPath: '/templates/create-and-submit-templates',
      });

      await signInPage.cognitoSignIn(users['client-no-name']?.email as string);

      await expect(page).toHaveURL(
        `${baseURL}/templates/create-and-submit-templates`
      );

      const cookies = await getCookies(page);

      expect(cookies.csrf_token?.sameSite).toEqual('Strict');
      expect(cookies.csrf_token?.secure).toEqual(true);

      const idToken = jwtDecode<CustomIdTokenClaims>(
        cookies.idToken?.value as string
      );

      const scenario = scenarios['client-no-name'];

      expect(idToken['nhs-notify:client-id']).not.toBeUndefined();
      expect(idToken['nhs-notify:client-id']).toBe(scenario.clientId);
      expect(idToken['nhs-notify:client-name']).toBeUndefined();
      expect(idToken['nhs-notify:campaign-id']).not.toBeUndefined();
      expect(idToken['nhs-notify:campaign-id']).toBe(
        scenario.clientConfig?.campaignId
      );

      const accessToken = jwtDecode<CustomAccessTokenClaims>(
        cookies.accessToken?.value as string
      );

      expect(accessToken['nhs-notify:client-id']).not.toBeUndefined();
      expect(accessToken['nhs-notify:client-id']).toBe(scenario.clientId);
      expect(accessToken['nhs-notify:campaign-id']).not.toBeUndefined();
      expect(accessToken['nhs-notify:campaign-id']).toBe(
        scenario.clientConfig?.campaignId
      );
    });
  });

  test.describe('Error handling', () => {
    test('should not log user in, when email is invalid', async ({ page }) => {
      const signInPage = new IamWebAuthSignInPage(page);

      await signInPage.loadPage({
        redirectPath: '/templates/create-and-submit-templates',
      });

      await signInPage.emailInput.fill('this-should-not-work@nhs.net');

      await signInPage.passwordInput.fill(process.env.TEMPORARY_USER_PASSWORD);

      await signInPage.clickSubmitButton();

      await expect(signInPage.errorMessage).toHaveText('User does not exist.');
    });

    test('should not log user in, when password is invalid', async ({
      page,
    }) => {
      const signInPage = new IamWebAuthSignInPage(page);

      await signInPage.loadPage({
        redirectPath: '/templates/create-and-submit-templates',
      });

      await signInPage.emailInput.fill(users['no-client']?.email as string);

      await signInPage.passwordInput.fill('invalid-password');

      await signInPage.clickSubmitButton();

      await expect(signInPage.errorMessage).toHaveText(
        'Incorrect username or password.'
      );
    });
  });
});
