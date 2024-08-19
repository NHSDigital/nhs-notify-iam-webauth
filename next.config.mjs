/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/auth',
  async redirects() {
    return [
      {
        source: '/',
        destination: '/auth',
        basePath: false,
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
