import { defineBackend } from '@aws-amplify/backend';
import { authConfig } from './auth/resource';

const backend = defineBackend({});
backend.addOutput(authConfig);

export default backend;
