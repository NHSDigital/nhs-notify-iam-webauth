import { Authenticator } from '@aws-amplify/ui-react';
import content from '@/src/content/content';
import { Redirect } from '../molecules/Redirect/Redirect';

export function CognitoSignInForm() {
  return (
    <div className='nhsuk-u-padding-6 notify-content notify-cognito-sign-in-form'>
      <h2 className='nhsuk-heading-m'>
        {content.components.cognitoSignInComponent.heading}
      </h2>
      <Authenticator variation='default' hideSignUp>
        <Redirect />
      </Authenticator>
    </div>
  );
}
