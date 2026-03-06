import withPWA from 'next-pwa';

const nextConfig = {
  reactStrictMode: true,
  turbopack: {}
};

export default withPWA({
  dest: 'build',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})(nextConfig);

