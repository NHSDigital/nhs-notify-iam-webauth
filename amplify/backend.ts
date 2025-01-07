import { defineBackend } from '@aws-amplify/backend';
import { remoteAuthConfig, sandboxAuthConfig } from './auth/resource';

if (process.env.USE_LOCAL_AUTH === 'true') {
  defineBackend(sandboxAuthConfig);
} else {
  const backend = defineBackend({});
  backend.addOutput(remoteAuthConfig);
}