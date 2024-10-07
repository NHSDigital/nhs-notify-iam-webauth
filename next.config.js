
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '/auth';

module.exports = {
  basePath,

  async redirects() {
    return [
      {
        source: `${basePath}/redirect/:path*`,
        destination: '/:path*',
        basePath: false,
        permanent: false,
      }
    ];
  },
}
