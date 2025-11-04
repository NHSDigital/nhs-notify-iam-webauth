import { expect, test } from '@playwright/test';
import { CognitoUserHelper, User } from '@helpers/cognito-user-helper';
import { IamWebAuthInactivePage } from '@pages/iam-webauth-inactive-page';
import { getCookies } from '@helpers/cookies';
import { IamWebAuthSignInPage } from '@pages/iam-webauth-signin-page';
import { randomUUID } from 'node:crypto';

test.describe('Inactive', () => {
  let user: User;

  const cognitoHelper = new CognitoUserHelper();

  const client = {
    clientId: randomUUID(),
    clientConfig: {
      name: 'inactive client',
    },
  };

  test.beforeAll(async () => {
    user = await cognitoHelper.createUser('playwright-inactive', client);
  });

  test.afterAll(async () => {
    await cognitoHelper.deleteUser(user.userId, client);
  });

  test('should sign user out', async ({ baseURL, page }) => {
    const inactivePage = new IamWebAuthInactivePage(page);
    const signInPage = new IamWebAuthSignInPage(page);

    await signInPage.loadPage({
      redirectPath: '/templates/create-and-submit-templates',
    });

    await signInPage.cognitoSignIn(user.email);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );

    const cookiesPreSignOut = await getCookies(page);

    expect(Object.keys(cookiesPreSignOut)).toHaveLength(7);

    await inactivePage.loadPage({
      redirectPath: '/templates/create-and-submit-templates',
    });

    await expect(async () => {
      const cookiesPostSignOut = await getCookies(page);

      expect(Object.keys(cookiesPostSignOut)).toHaveLength(0);
    }).toPass({
      intervals: [250, 1000, 1500],
      timeout: 15_000,
    });

    await inactivePage.clickSignInButton();

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=%2Ftemplates%2Fcreate-and-submit-templates`
    );
  });
});
