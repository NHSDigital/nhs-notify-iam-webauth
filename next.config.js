
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/auth';

module.exports = {
  basePath,
  reactStrictMode: false,

  async redirects() {
    /*
    * Doing redirect rewrites will bypass NextJs' base path
    * Without it a redirect('/templates/create-and-submit') would go to /auth/templates/create-and-submit
    */
    return [
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
      }
    ];
  },
}
