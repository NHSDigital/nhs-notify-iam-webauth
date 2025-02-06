import { getConstants } from '../utils/public-constants';

const { BASE_PATH } = getConstants();

const headerComponent = {
  serviceName: 'Notify',
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

const cognitoSignInComponent = {
  heading: 'Dev Only - Sign in with Email / Password',
};

const mainLayout = {
  title: 'Sign in - Create and submit templates - NHS Notify',
  description: 'Sign in - Create and submit templates - NHS Notify',
};

const signInPage = {
  pageHeading: 'Sign in',
  federatedSignInSectionHeading: 'Sign in using an NHS account',
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
  },
};

export default content;
