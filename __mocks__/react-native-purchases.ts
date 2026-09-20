/**
 * Manual jest mock for react-native-purchases (RevenueCat SDK).
 *
 * The real package bridges to a native module (`NativeModules.RNPurchases`)
 * that doesn't exist under jest-expo — same class of problem already solved
 * for react-native-maps/expo-video in this folder (see those files for the
 * detailed rationale). Every method this codebase actually calls is a
 * `jest.fn()` so each test sets its own `mockResolvedValue`/
 * `mockRejectedValue` on it, imported the normal way
 * (`import Purchases from 'react-native-purchases'`) — `jest.config.js` →
 * `moduleNameMapper` swaps in this file for any import of the real package,
 * no explicit `jest.mock('react-native-purchases')` needed per test file.
 *
 * `configure`/`isConfigured`/`getAppUserID` get harmless defaults so tests
 * that don't care about the configure step (ie. anything downstream of
 * `useConfigurePurchases`) don't have to mock them explicitly.
 */

// Solo el código usado por este proyecto (ver usePurchasePrixmaPlus.ts →
// isUserCancelledError) — el enum real tiene muchos más valores sin uso aquí.
export const PURCHASES_ERROR_CODE = {
  UNKNOWN_ERROR: '0',
  PURCHASE_CANCELLED_ERROR: '1',
} as const;

const Purchases = {
  configure: jest.fn(),
  isConfigured: jest.fn().mockResolvedValue(false),
  getAppUserID: jest.fn().mockResolvedValue('mock-app-user-id'),
  getOfferings: jest.fn(),
  purchasePackage: jest.fn(),
  restorePurchases: jest.fn(),
  getCustomerInfo: jest.fn(),
};

export default Purchases;
