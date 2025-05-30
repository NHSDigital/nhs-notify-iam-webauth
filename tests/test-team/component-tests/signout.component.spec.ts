import { expect, test } from '@playwright/test';
import { CognitoUserHelper, User } from 'helpers/cognito-user-helper';
import { IamWebAuthSignInPage } from 'pages/iam-webauth-signin-page';
import { getCookies } from 'helpers/cookies';

test.describe('SignOut', () => {
  let user: User;

  const cognitoHelper = new CognitoUserHelper();

  test.beforeAll(async () => {
    user = await cognitoHelper.createUser('playwright-signout');
  });

  test.afterAll(async () => {
    await cognitoHelper.deleteUser(user.userId);
  });

  test('should sign user out', async ({ baseURL, page }) => {
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

    await page.goto(`${baseURL}/auth/signout`);

    await expect(async () => {
      const cookiesPostSignOut = await getCookies(page);

      expect(Object.keys(cookiesPostSignOut)).toHaveLength(0);
    }).toPass();

    await signInPage.loadPage({
      redirectPath: '/templates/create-and-submit-templates',
    });

    await expect(signInPage.emailInput).toBeVisible();
  });
});
