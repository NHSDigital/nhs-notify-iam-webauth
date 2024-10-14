import { type Page } from '@playwright/test';
import { IamWebAuthBasePage } from './iam-webauth-base-page';

export class IamWebAuthStartPage extends IamWebAuthBasePage {
  readonly startPageUrl: string;

  constructor(page: Page) {
    super(page);
    this.startPageUrl = '/';
  }

  async navigateToStartPage() {
    await this.navigateTo(this.startPageUrl);
  }
}
