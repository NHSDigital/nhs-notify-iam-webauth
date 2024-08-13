import { test, expect } from '@playwright/test';
import { IamWebAuthStartPage } from '../pages/iam-webauth-start-page';

test.describe('Create Template - Start Page', () => {
  test('should land on start page when navigating to "/" url', async ({
    page,
    baseURL,
  }) => {
    const startPage = new IamWebAuthStartPage(page);

    await startPage.navigateToStartPage();

    await expect(page).toHaveURL(`${baseURL}/`);
    expect(await startPage.pageHeader.textContent()).toBe('Hello World!');
  });
});
