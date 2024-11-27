import { test, expect, BrowserContext, Browser, Page } from '@playwright/test';
import { TOTP } from 'totp-generator';
import { getSecret } from '../helpers/secret-client';
import axios from 'axios';
import { getSsmParameterValue } from '../helpers/ssm-client';

const environment = 'mara15';
const clientId = '4ojgr4rn6bmckvq1ilhfd5gshf';

const identityProvider = 'CIS2-int';

const appName = `nhs-notify-${environment}-app`;
const notifyOrigin = `https://${environment}.iam.dev.nhsnotify.national.nhs.uk`;
const cis2CredentialsSecretId = 'test/cis2-int/credentials';
const amplifyPasswordSsmName = `/${appName}/amplify_password`;
const redirectUri = `${notifyOrigin}/auth/`;
const cognitoUrl = `https://auth.${environment}.iam.dev.nhsnotify.national.nhs.uk/oauth2/authorize`;

const debug = false;

type Cis2Credentials = {
  username: string;
  password: string;
  totpSecret: string;
};

async function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    if (debug) {
      setTimeout(resolve, ms);
    } else {
      resolve();
    }
  });
}

async function configureBrowserContext(
  browser: Browser,
  appPassword: string
): Promise<BrowserContext> {
  return await browser.newContext({
    httpCredentials: {
      username: appName,
      password: appPassword,
      origin: notifyOrigin,
    },
    recordVideo: debug
      ? {
          dir: '.',
        }
      : undefined,
  });
}

async function getCognitoToCis2RedirectUrl(): Promise<string> {
  const cognitoQueryParameters = {
    client_id: clientId,
    redirect_uri: redirectUri,
    identity_provider: identityProvider,
    response_type: 'code',
  };

  const response = await axios.get(cognitoUrl, {
    params: cognitoQueryParameters,
    validateStatus: () => true,
    maxRedirects: 0,
  });
  const cis2Url = response.headers['location'];

  const cis2BaseUrlRegexPattern =
    'https:\\/\\/am\\.nhsint\\.auth-ptl\\.cis2\\.spineservices\\.nhs\\.uk:443\\/openam\\/oauth2\\/realms\\/root\\/realms\\/NHSIdentity\\/realms\\/Healthcare\\/authorize';
  const cis2UrlRegexPattern = `(${cis2BaseUrlRegexPattern})(\\?)(.+)`;
  const cis2UrlRegex = new RegExp(cis2UrlRegexPattern);
  expect(cis2Url).toMatch(new RegExp(cis2UrlRegex));

  const cis2UrlParts = cis2UrlRegex.exec(cis2Url) || [];
  return `${cis2UrlParts[1]}?acr_values=AAL2_OR_AAL3_ANY&${cis2UrlParts[3]}`;
}

test.describe('CIS2 federation', () => {
  let cis2Credentials: Cis2Credentials;
  let appPassword: string;
  let browserContext: BrowserContext;

  test.beforeAll(async () => {
    cis2Credentials = await getSecret<Cis2Credentials>(cis2CredentialsSecretId);
    appPassword = await getSsmParameterValue(amplifyPasswordSsmName);
  });

  test.beforeEach(async ({ browser }) => {
    browserContext = await configureBrowserContext(
      browser,
      appPassword
    );
  });

  test.afterEach(async () => {
    await browserContext.close();
  });

  test('should sign user in, then redirect user to redirect path', async () => {
      const page = await browserContext.newPage();
      
      const modifiedCis2Url = await getCognitoToCis2RedirectUrl();

      // Cognito to CIS2 redirect
      await page.goto(modifiedCis2Url);
      await page.waitForSelector(
        `//label[contains(text(), 'Authenticator app')]`
      );
      await sleep(500);

      // Auth method selection
      await page.click(`//label[contains(text(), 'Authenticator app')]`);
      await sleep(1500);
      await page.click(`//button[contains(text(), 'Continue')]`);
      await page.waitForSelector(`//input[@name='password']`);
      await sleep(500);

      // Username password entry
      await page
        .locator(`//input[@name='email']`)
        .fill(cis2Credentials.username);
      await page
        .locator(`//input[@name='password']`)
        .fill(cis2Credentials.password);
      await sleep(1500);
      await page.click(`//button[contains(text(), 'Continue')]`);
      await page.waitForSelector(
        `//input[@data-vv-as='Enter verification code']`
      );
      await sleep(500);

      // One time passcode entry
      const { otp } = TOTP.generate(cis2Credentials.totpSecret, {
        algorithm: 'SHA-1',
      });
      await page
        .locator(`//input[@data-vv-as='Enter verification code']`)
        .fill(otp);
      await sleep(1500);
      await page.click(`//button[contains(text(), 'Submit')]`);
      await page.waitForSelector(
        `//div[contains(@class, 'modal-content-desktop')]//form[@name='loginWithIdentityProvider']//input[@value='${identityProvider}']`
      );
      await sleep(500);

      // Confirm logging in via CIS2
      await page.click(
        `//div[contains(@class, 'modal-content-desktop')]//form[@name='loginWithIdentityProvider']//input[@value='${identityProvider}']`
      );

      // Arrive at the app's landing page
      await page.waitForSelector(`//h1[contains(text(), 'Hello World!')]`);
      await sleep(2000);
    });
});
