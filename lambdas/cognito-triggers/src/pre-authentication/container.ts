import loadConfig from '@/pre-authentication/config';

function container() {
  const { USER_POOL_CLIENT_ID, USER_POOL_ID } = loadConfig();
}

export default container;
