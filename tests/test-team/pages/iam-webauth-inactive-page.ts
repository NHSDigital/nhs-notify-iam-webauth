import { Locator, Page } from '@playwright/test';
import { IamWebAuthBasePage } from './iam-webauth-base-page';

export class IamWebAuthInactivePage extends IamWebAuthBasePage {
  public readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
  }

  async clickSignInButton() {
    await this.signInButton.click();
  }

  async loadPage({ redirectPath }: { redirectPath: string }): Promise<void> {
    await this.page.goto(
      `/auth/inactive?redirect=${encodeURIComponent(redirectPath)}`,
      {
        waitUntil: 'load',
      }
    );
  }
}
