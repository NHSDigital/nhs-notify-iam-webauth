const headerComponent = {
  serviceName: 'Notify',
  links: {
    logIn: 'Log in',
    logOut: 'Log out',
  },
};

const footerComponent = {
  nhsEngland: 'NHS England',
  supportLinks: 'Support links',
  links: {
    accessibilityStatement: 'Accessibility statement',
    contactUs: 'Contact us',
    cookies: 'Cookies',
    privacyPolicy: 'Privacy policy',
    termsAndCondition: 'Terms and conditions',
  },
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
  pages: {},
};


export default content;
