declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TEMPORARY_USER_PASSWORD: string;
      USER_PASSWORD: string;
      AWS_COGNITO_USER_POOL_ID: string;
      USERS_TABLE: string;
      USER_EMAIL_PREFIX: string;
    }
  }
}

export {};
