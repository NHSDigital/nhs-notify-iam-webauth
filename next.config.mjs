/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/auth~aiva2ccm-6010test',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth~aiva2ccm-6010test',
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
