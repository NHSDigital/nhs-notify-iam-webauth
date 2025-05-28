import { Locator, Page } from '@playwright/test';
import { IamWebAuthBasePage } from 'pages/iam-webauth-base-page';

export class IamWebAuthInactivePage extends IamWebAuthBasePage {
  public readonly signInButton: Locator;

  constructor(page: Page) {
    super(page);
    this.signInButton = page.locator('[id="inactive-sign-in"]');
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
