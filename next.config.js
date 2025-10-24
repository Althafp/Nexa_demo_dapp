/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['nexa-wallet-sdk', 'wallet-comms-sdk', 'js-big-decimal', 'libnexa-ts', 'bip39'],
  webpack: (config, options) => {
    const { isServer } = options;

    config.experiments = {
      ...config.experiments, 
      topLevelAwait: true,
      asyncWebAssembly: true,
      layers: true
    };

    // Force single instance of critical dependencies
    const libnexaPath = path.resolve(__dirname, 'node_modules/libnexa-ts');
    const walletSdkPath = path.resolve(__dirname, 'node_modules/nexa-wallet-sdk');
    const walletCommsSdkPath = path.resolve(__dirname, 'node_modules/wallet-comms-sdk');

    config.resolve.alias = {
      ...config.resolve.alias,
      'libnexa-ts': libnexaPath,
      'nexa-wallet-sdk': walletSdkPath,
      'wallet-comms-sdk': walletCommsSdkPath,
      net: false,
      tls: false,
      fs: false,
    };

    // For server builds, externalize these packages to prevent bundling issues
    if (isServer) {
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push('libnexa-ts', 'nexa-wallet-sdk', 'wallet-comms-sdk');
      }
    }

    // Prevent multiple instances by optimizing module resolution
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
    };

    // Handle CommonJS modules
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts', '.tsx'],
      '.mjs': ['.mjs', '.mts'],
      '.cjs': ['.cjs', '.cts'],
    };

    // Ensure ESM modules are properly handled
    config.module.rules.push({
      test: /\.m?js$/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
    });

    return config
  },
}

module.exports = nextConfig
