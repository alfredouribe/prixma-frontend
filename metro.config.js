const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@brand/')) {
    const rest = moduleName.slice('@brand/'.length);
    return context.resolveRequest(
      context,
      path.resolve(__dirname, 'brand', rest),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
