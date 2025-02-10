const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/auth';
const domain = process.env.NOTIFY_DOMAIN_NAME ?? 'localhost:3000';
const allowedOrigins = [domain, domain.replace('iam', 'web-gateway')];

module.exports = {
  basePath,

  experimental: {
    serverActions: {
      allowedOrigins,
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
      {
        source: `${basePath}/redirect/:path*`,
        destination: '/:path*',
        basePath: false,
        permanent: false,
      },
      // Note: This redirect is for the home page which would be the web-cms
      {
        source: `${basePath}/home`,
        destination: '/',
        basePath: false,
        permanent: false,
      },
    ];
  },
};
