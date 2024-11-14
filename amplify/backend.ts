import { defineBackend } from '@aws-amplify/backend';
import { remoteAuthConfig, sandboxAuthConfig } from './auth/resource';

let backend;

if (process.env.USE_LOCAL_AUTH === 'true') {
  backend = defineBackend(sandboxAuthConfig);
} else {
  backend = defineBackend({});
  backend.addOutput(remoteAuthConfig);
}

export default backend;
