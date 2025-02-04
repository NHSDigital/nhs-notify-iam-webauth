import { Authenticator } from '@aws-amplify/ui-react';
import { Redirect } from '../molecules/Redirect/Redirect';

export function CognitoLoginForm() {
  return (
    <div className='nhsuk-u-padding-6 notify-content notify-cognito-login-form'>
      <h2 className='nhsuk-heading-m'>
        Dev Only - Sign in with Email / Password
      </h2>
      <Authenticator variation='default' hideSignUp>
        <Redirect />
      </Authenticator>
    </div>
  );
}
