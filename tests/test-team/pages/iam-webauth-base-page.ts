import { Locator, type Page } from '@playwright/test';

export abstract class IamWebAuthBasePage {
  public readonly page: Page;

  public readonly pageHeader: Locator;

  public readonly loginLink: Locator;

  public readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page.locator('h1');
    this.loginLink = page.locator('[id="login-link"]');
    this.logoutLink = page.locator('[id="logout-link"]');
  }

  abstract loadPage({ redirectPath }: { redirectPath: string }): Promise<void>;
}
