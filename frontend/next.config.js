const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/auth';

module.exports = {
  assetPrefix: basePath,
  basePath,

  sassOptions: {
    quietDeps: true,
  },

  experimental: {
    serverActions: {
      allowedOrigins: ['**.nhsnotify.national.nhs.uk', 'notify.nhs.uk'],
    },
  },

  async redirects() {
    /*
     * Doing redirect rewrites will bypass NextJs' base path
     * Without it a redirect('/templates/create-and-submit') would go to /auth/templates/create-and-submit
     */
    return [
      {
        source: '/',
        destination: basePath,
        basePath: false,
        permanent: false,
      },
    ];
  },
};
