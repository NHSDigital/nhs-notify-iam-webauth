import { Locator, type Page } from '@playwright/test';

export class IamWebAuthBasePage {
  readonly page: Page;

  readonly pageHeader: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeader = page
      .locator('[class="nhsuk-heading-xl"]')
      .and(page.locator('h1'));
  }

  async navigateTo(url: string) {
    await this.page.goto(url, { waitUntil: 'load' });
  }

  async NavigateWithIntercept(url: string) {
    await this.page.route('', (route) => {
      route.request();
    });

    await this.page.goto(url);
  }
}
