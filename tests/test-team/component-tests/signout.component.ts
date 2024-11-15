import { test, expect } from '@playwright/test';
import { CognitoUserHelper, User } from '../helpers/cognito-user-helper';
import { IamWebAuthSignInPage } from '../pages/iam-webauth-signin-page';

test.describe('SignIn', () => {
  let user: User;

  const cognitoHelper = new CognitoUserHelper();

  test.beforeAll(async () => {
    user = await cognitoHelper.createUser('playwright-signout');
  });

  test.afterAll(async () => {
    await cognitoHelper.deleteUser(user.userId);
  });

  test('should sign user out, then redirect user to redirect path', async ({
    page,
    baseURL,
  }) => {
    const signInPage = new IamWebAuthSignInPage(page);

    await signInPage.loadPage({
      redirectPath: '/templates/create-and-submit-templates',
    });

    await signInPage.cognitoSignIn(user.email);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );

    await page.goto(
      `${baseURL}/auth/signout?redirect=${encodeURIComponent('/templates/create-and-submit-templates')}`
    );

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );

    await signInPage.loadPage({
      redirectPath: '/templates/create-and-submit-templates',
    });

    await expect(signInPage.emailInput).toBeVisible();
  });
});
