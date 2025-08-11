import z from 'zod';

function loadConfig() {
  return z
    .object({ USER_POOL_ID: z.string(), USER_POOL_CLIENT_ID: z.string() })
    .parse(process.env);
}

export default loadConfig;
