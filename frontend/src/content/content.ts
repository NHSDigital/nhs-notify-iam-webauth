import { formatTime } from '@/utils/format-time';
import { getConstants } from '@/utils/public-constants';

const { BASE_PATH, TIME_TILL_LOGOUT_SECONDS } = getConstants();

const generateMetaTitle = (title: string) => ({
  title: `${title} - NHS Notify`,
  description: `${title} - NHS Notify`,
});

const createTitleSegment = 'Create and submit templates';

const headerComponent = {
  serviceName: 'Notify',
  serviceLink: `/templates/create-and-submit-templates`,
  links: {
    signIn: { text: 'Sign in', href: BASE_PATH },
    signOut: { text: 'Sign out', href: `${BASE_PATH}/signout` },
  },
};

const footer = {
  nhsEngland: 'NHS England',
  supportLinks: 'Support links',
  links: {
    acceptableUsePolicy: {
      text: 'Acceptable use policy',
      url: 'https://digital.nhs.uk/services/nhs-notify/acceptable-use-policy',
    },
    accessibilityStatement: {
      text: 'Accessibility statement',
      url: '/accessibility',
    },
    cookies: { text: 'Cookies', url: '/cookies' },
    privacy: {
      text: 'Privacy',
      url: 'https://digital.nhs.uk/services/nhs-notify/transparency-notice',
    },
    termsAndConditions: {
      text: 'Terms and conditions',
      url: 'https://digital.nhs.uk/services/nhs-notify/terms-and-conditions',
    },
  },
};

const inactivePage = {
  pageHeading: "You've been signed out",
  body: [
    `You've been signed out because you've not used this service for ${formatTime(Number(TIME_TILL_LOGOUT_SECONDS))}`,
    'Any unsaved changes have been lost.',
    'Sign in again to create and submit a template to NHS Notify.',
  ],
  meta: generateMetaTitle(`You've been signed out - ${createTitleSegment}`),
};

const cognitoSignInComponent = {
  heading: 'Dev Only - Sign in with Email / Password',
};

const noClientRedirectHref = `${BASE_PATH}/request-to-be-added-to-a-service`;

const mainLayout = { ...generateMetaTitle(`Sign in - ${createTitleSegment}`) };

const signInPage = {
  pageHeading: 'Sign in',
  federatedSignInSectionHeading: 'Sign in using an NHS account',
  noClientRedirectHref,
};

const signOutPage = {
  content: 'Signed out',
  meta: generateMetaTitle(`Signed out - ${createTitleSegment}`),
};

const requestToBeAddedToClientPage = {
  pageHeading: 'Request to be added to a service',
  ifOnboardingSubhead: "If you're onboarding with NHS Notify",
  ifOnboardingPara1Md:
    'Contact your onboarding manager or email: [england.nhsnotify@nhs.net](mailto:england.nhsnotify@nhs.net)',
  ifOnboardingPara2: 'Tell us:',
  ifOnboardingMessageRequirements: [
    'your full name',
    'the email address you use for your Care Identity',
    'the organisation or company you work for',
    'the service, programme or project you work in',
  ],
  ifOnboardingPara3:
    'After you have been added you will be able to access the service to create and submit templates.',
  ifExistingSubhead: "If you're an existing NHS Notify user",
  ifExistingPara1Md:
    'If you are currently using NHS Notify, raise a request with [ServiceNow]() to get added to a service',
  meta: generateMetaTitle('Request to be added to a service'),
};

const oauth2Redirect = {
  heading: 'Redirecting, please wait',
  noClientRedirectHref,
};

const content = {
  global: { mainLayout },
  components: { headerComponent, footer, cognitoSignInComponent },
  pages: {
    inactivePage,
    requestToBeAddedToClientPage,
    oauth2Redirect,
    signInPage,
    signOutPage,
  },
};

export default content;
