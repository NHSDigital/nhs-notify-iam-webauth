import { expect, test } from '@playwright/test';
import { CognitoUserHelper, User } from 'helpers/cognito-user-helper';
import { IamWebAuthSignInPage } from 'pages/iam-webauth-signin-page';
import { getCookies } from 'helpers/cookies';

test.describe('SignIn', () => {
  let user: User;

  const cognitoHelper = new CognitoUserHelper();

  test.beforeAll(async () => {
    user = await cognitoHelper.createUser('playwright-signIn');
  });

  test.afterAll(async () => {
    await cognitoHelper.deleteUser(user.userId);
  });

  test('should sign user in, then redirect user to redirect path', async ({
    baseURL,
    page,
  }) => {
    const signInPage = new IamWebAuthSignInPage(page);

    await signInPage.loadPage({
      redirectPath: '/templates/create-and-submit-templates',
    });

    await signInPage.cognitoSignIn(user.email);

    await expect(page).toHaveURL(
      `${baseURL}/templates/create-and-submit-templates`
    );

    const cookies = await getCookies(page);

    expect(cookies.csrf_token?.sameSite).toEqual('Strict');
    expect(cookies.csrf_token?.secure).toEqual(true);
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

      await signInPage.emailInput.fill(user.email);

      await signInPage.passwordInput.fill('invalid-password');

      await signInPage.clickSubmitButton();

      await expect(signInPage.errorMessage).toHaveText(
        'Incorrect username or password.'
      );
    });
  });
});
