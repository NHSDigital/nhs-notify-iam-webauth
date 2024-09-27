import { Amplify } from 'aws-amplify';
import outputs from '../amplify_outputs.json';

export function initAmplify () {
  Amplify.configure(outputs, { ssr: true });
}
