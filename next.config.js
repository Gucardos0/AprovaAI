/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["192.168.0.36"],
  turbopack: {
    root: __dirname,
  },
};

module.exports = nextConfig;
