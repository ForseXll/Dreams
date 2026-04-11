/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ['localhost', '127.0.0.1'],
  compiler: {
    styledComponents: true,
  },
  reactStrictMode: true,
};

module.exports = nextConfig;
