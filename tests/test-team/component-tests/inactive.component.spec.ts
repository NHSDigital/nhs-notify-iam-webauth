import { expect, test } from '@playwright/test';
import { CognitoUserHelper, User } from '@helpers/cognito-user-helper';
import { IamWebAuthInactivePage } from '@pages/iam-webauth-inactive-page';
import { getCookies } from '@helpers/cookies';
import { IamWebAuthSignInPage } from '@pages/iam-webauth-signin-page';

test.describe('Inactive', () => {
  let user: User;

  const cognitoHelper = new CognitoUserHelper();

  test.beforeAll(async () => {
    user = await cognitoHelper.createUser('playwright-inactive');
  });

  test.afterAll(async () => {
    await cognitoHelper.deleteUser(user.userId);
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
    }).toPass();

    await inactivePage.clickSignInButton();

    await expect(page).toHaveURL(
      `${baseURL}/auth?redirect=%2Ftemplates%2Fcreate-and-submit-templates`
    );
  });
});
