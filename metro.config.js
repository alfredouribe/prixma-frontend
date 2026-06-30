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
  if (moduleName.startsWith('@assets/')) {
    const rest = moduleName.slice('@assets/'.length);
    return context.resolveRequest(
      context,
      path.resolve(__dirname, 'assets', rest),
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
