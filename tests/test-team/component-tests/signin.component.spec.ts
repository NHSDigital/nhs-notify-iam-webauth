import { randomUUID } from 'node:crypto';
import { expect, test } from '@playwright/test';
import { type JwtPayload, jwtDecode } from 'jwt-decode';
import {
  type Client,
  CognitoUserHelper,
  type User,
} from '@helpers/cognito-user-helper';
import { IamWebAuthSignInPage } from '@pages/iam-webauth-signin-page';
import { getCookies } from '@helpers/cookies';

type Scenario =
  | 'no-client'
  | 'client-fully-configured'
  | 'client-not-configured';

const scenarios: Record<Scenario, Client | null> = {
  'no-client': null,
  'client-fully-configured': {
    clientId: randomUUID(),
    clientConfig: { name: randomUUID() },
  },
  'client-not-configured': {
    clientId: randomUUID(),
  },
};

type CustomIdTokenClaims = JwtPayload & {
  'nhs-notify:client-id': string;
  'nhs-notify:client-name': string;
  preferred_username?: string;
  given_name?: string;
  family_name?: string;
  email?: string;
};

type CustomAccessTokenClaims = JwtPayload & {
  'nhs-notify:client-id': string;
};

test.describe('SignIn', () => {
  const users: Partial<Record<Scenario, User>> = {};
  const cognitoHelper = new CognitoUserHelper();

  test.beforeAll(async () => {
    await Promise.all(
      Object.entries(scenarios).map(async ([scenario, client]) => {
        const user = await cognitoHelper.createUser(
          `playwright-signIn__${scenario}`,
          client,
          {
            given_name: 'Test',
            family_name: 'User',
            preferred_username: 'Test User',
          }
        );

        users[scenario as Scenario] = user;
      })
    );
  });

  test.afterAll(async () => {
    await Promise.all(
      Object.entries(scenarios).map(async ([scenario, client]) => {
        const user = users[scenario as Scenario];

        if (user) {
          await cognitoHelper.deleteUser(user.userId, client);
        }
      })
    );
  });

  test.describe('when user is assigned to an unconfigured client', () => {
    test('should sign user in with clientId and identity claims in tokens, then redirect user to redirect path', async ({
      baseURL,
      page,
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
        scenarios['client-not-configured']?.clientId
      );
      expect(idToken['nhs-notify:client-name']).toBeUndefined();

      expect(idToken.preferred_username).toBe('Test User');
      expect(idToken.given_name).toBe('Test');
      expect(idToken.family_name).toBe('User');

      const accessToken = jwtDecode<CustomAccessTokenClaims>(
        cookies.accessToken?.value as string
      );

      expect(accessToken['nhs-notify:client-id']).toBe(
        scenarios['client-not-configured']?.clientId
      );
    });
  });

  test.describe('when user is assigned to a fully configured client', () => {
    test('should sign user in with client and identity claims in tokens, then redirect user to redirect path', async ({
      baseURL,
      page,
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
      expect(idToken['nhs-notify:client-id']).toBe(scenario?.clientId);
      expect(idToken['nhs-notify:client-name']).not.toBeUndefined();
      expect(idToken['nhs-notify:client-name']).toBe(
        scenario?.clientConfig?.name
      );

      expect(idToken.preferred_username).toBe('Test User');
      expect(idToken.given_name).toBe('Test');
      expect(idToken.family_name).toBe('User');

      const accessToken = jwtDecode<CustomAccessTokenClaims>(
        cookies.accessToken?.value as string
      );

      expect(accessToken['nhs-notify:client-id']).not.toBeUndefined();
      expect(accessToken['nhs-notify:client-id']).toBe(scenario?.clientId);
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

      await signInPage.emailInput.fill(
        users['client-fully-configured']?.email as string
      );

      await signInPage.passwordInput.fill('invalid-password');

      await signInPage.clickSubmitButton();

      await expect(signInPage.errorMessage).toHaveText(
        'Incorrect username or password.'
      );
    });

    test('should not log in, when user is not assigned to a client, redirects to error page', async ({
      page,
    }) => {
      const signInPage = new IamWebAuthSignInPage(page);

      await signInPage.loadPage({
        redirectPath: '/templates/create-and-submit-templates',
      });

      await signInPage.emailInput.fill(users['no-client']?.email as string);

      await signInPage.passwordInput.fill(process.env.TEMPORARY_USER_PASSWORD);

      await signInPage.clickSubmitButton();

      await expect(page).toHaveURL('/auth/request-to-be-added-to-a-service');
    });
  });
});
