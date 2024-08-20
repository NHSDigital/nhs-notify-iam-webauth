/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/auth_aiva2ccm-6010test',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth_aiva2ccm',
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
