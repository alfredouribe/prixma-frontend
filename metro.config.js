const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Metro 0.83 (Expo SDK 54) activa `unstable_enablePackageExports` por
// default. Eso rompe la resolución de paquetes CJS legacy que solo
// declaran un campo `browser` (no `exports`) en su package.json — como
// `util`, que `expo-notifications` arrastra indirectamente vía
// `@ide/backoff` → `assert` → `util` (para el auto-registro de refresco
// de token, `DevicePushTokenAutoRegistration.fx.js`). Con el flag activo,
// Metro trata la sola presencia de `browser` como señal de modo
// "exports-aware" y deja de resolver subrutas relativas como
// `./support/types` aunque el archivo exista en disco — confirmado
// leyendo node_modules/util/util.js y node_modules/util/package.json.
// Desactivarlo restaura la resolución relativa normal para estos paquetes.
config.resolver.unstable_enablePackageExports = false;

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
