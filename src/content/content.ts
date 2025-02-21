import { formatTime } from '../utils/format-time';
import { getConstants } from '../utils/public-constants';

const { TIME_TILL_LOGOUT_SECONDS, BASE_PATH } = getConstants();

const generateMetaTitle = (title: string) => ({
  title: `${title} - Create and submit templates - NHS Notify`,
  description: `${title} - Create and submit templates - NHS Notify`,
});

const headerComponent = {
  serviceName: 'Notify',
  serviceLink: `/templates/create-and-submit-templates`,
  links: {
    signIn: { text: 'Sign in', href: BASE_PATH },
    signOut: { text: 'Sign out', href: `${BASE_PATH}/signout` },
  },
};

const footerComponent = {
  nhsEngland: 'NHS England',
  supportLinks: 'Support links',
  links: {
    accessibilityStatement: {
      text: 'Accessibility statement',
      url: '/accessibility',
    },
    contactUs: 'Contact us',
    cookies: 'Cookies',
    privacyPolicy: 'Privacy policy',
    termsAndCondition: 'Terms and conditions',
  },
};

const inactivePage = {
  pageHeading: "You've been signed out",
  body: [
    `You've been signed out because you've not used this service for ${formatTime(Number(TIME_TILL_LOGOUT_SECONDS))}`,
    'Any unsaved changes have been lost.',
    'Sign in again to create and submit a template to NHS Notify.',
  ],
  meta: generateMetaTitle("You've been signed out"),
};

const cognitoSignInComponent = {
  heading: 'Dev Only - Sign in with Email / Password',
};

const mainLayout = {
  ...generateMetaTitle('Sign in'),
};

const signInPage = {
  pageHeading: 'Sign in',
  federatedSignInSectionHeading: 'Sign in using an NHS account',
};

const signOutPage = {
  content: 'Signed out',
  meta: generateMetaTitle('Signed out'),
};

const content = {
  global: {
    mainLayout,
  },
  components: {
    headerComponent,
    footerComponent,
    cognitoSignInComponent,
  },
  pages: {
    signInPage,
    inactivePage,
    signOutPage,
  },
};

export default content;
