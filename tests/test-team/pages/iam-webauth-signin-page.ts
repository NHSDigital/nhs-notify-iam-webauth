import { Locator, Page } from '@playwright/test';
import { IamWebAuthBasePage } from './iam-webauth-base-page';

export class IamWebAuthSignInPage extends IamWebAuthBasePage {
  public readonly emailInput: Locator;
  public readonly passwordInput: Locator;
  public readonly confirmPasswordInput: Locator;
  public readonly submitButton: Locator;
  public readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('input[name="username"]');
    this.passwordInput = page.locator('input[name="password"]');
    this.confirmPasswordInput = page.locator('input[name="confirm_password"]');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.amplify-alert__body');
  }

  async cognitoSignIn(username: string) {
    await this.emailInput.fill(username);

    await this.passwordInput.fill(process.env.TEMPORARY_USER_PASSWORD);

    await this.clickSubmitButton();

    // Note: because this is a new user Cognito forces us to update the password.
    await this.cognitoUpdateUserPassword();
  }

  async cognitoUpdateUserPassword() {
    await this.passwordInput.fill(process.env.USER_PASSWORD);

    await this.confirmPasswordInput.fill(process.env.USER_PASSWORD);

    await this.clickSubmitButton();
  }

  async clickSubmitButton() {
    await this.submitButton.click();
  }

  async loadPage({ redirectPath }: { redirectPath: string }) {
    await this.page.goto(`/auth?redirect=${encodeURIComponent(redirectPath)}`, {
      waitUntil: 'load',
    });
  }
}
