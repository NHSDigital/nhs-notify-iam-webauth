import { Locator, type Page } from '@playwright/test';

export abstract class IamWebAuthBasePage {
  public readonly page: Page;

  public readonly pageHeader: Locator;

  public readonly signInLink: Locator;

  public readonly signOutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page.locator('h1');
    this.signInLink = page.locator('[id="sign-in-link"]');
    this.signOutLink = page.locator('[id="sign-out-link"]');
  }

  abstract loadPage({ redirectPath }: { redirectPath: string }): Promise<void>;
}
