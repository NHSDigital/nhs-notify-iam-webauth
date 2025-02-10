import { formatTime } from '../utils/format-time';
import { getConstants } from '../utils/public-constants';

const { TIME_TILL_LOGOUT_SECONDS } = getConstants();

const headerComponent = {
  serviceName: 'Notify',
  links: {
    signIn: 'Sign in',
    signOut: 'Sign out',
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
    `You've been signed out because not used this service for ${formatTime(Number(TIME_TILL_LOGOUT_SECONDS))}`,
    'Any unsaved changes have been lost',
    'Sign in again to create and submit a template to NHS Notify.',
  ],
  signInText: 'Sign in',
};

const mainLayout = {
  title: 'Sign in - Create and submit templates - NHS Notify',
  description: 'Sign in - Create and submit templates - NHS Notify',
};

const content = {
  global: {
    mainLayout,
  },
  components: {
    headerComponent,
    footerComponent,
  },
  pages: {
    inactivePage,
  },
};

export default content;
