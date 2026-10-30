/**
 * Mock manual de @sentry/react-native para tests.
 *
 * El paquete real se publica en ESM puro (ver dist/js/index.js: `export { ... }`),
 * lo cual rompe la transformación de Jest para cualquier archivo que lo importe
 * sin este mock (SyntaxError: Unexpected token 'export'). Al vivir en la carpeta
 * __mocks__ de la raíz del proyecto, Jest lo aplica automáticamente a cualquier
 * test que importe '@sentry/react-native', sin necesidad de un jest.mock()
 * explícito por archivo — mismo patrón ya usado para expo-router/expo-secure-store.
 *
 * Solo se exportan los miembros que el código de la app realmente usa hoy
 * (captureException en los hooks de subida, y init/wrap/integrations en
 * app/_layout.tsx) — se puede ampliar si algún test nuevo lo requiere.
 */
export const captureException = jest.fn();
export const init = jest.fn();
export const wrap = jest.fn((component: unknown) => component);
export const mobileReplayIntegration = jest.fn();
export const feedbackIntegration = jest.fn();
