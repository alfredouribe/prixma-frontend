module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/(?!vector-icons)|@expo-google-fonts|react-navigation|@react-navigation/.*|@unimodules|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  moduleNameMapper: {
    '^@expo/vector-icons(.*)$': '<rootDir>/__mocks__/@expo/vector-icons.tsx',
    '^@brand/(.*)$': '<rootDir>/brand/$1',
    '^react-native-reanimated$': '<rootDir>/__mocks__/react-native-reanimated.ts',
    '^react-native-gesture-handler$': '<rootDir>/__mocks__/react-native-gesture-handler.ts',
    '^@react-native-community/slider$': '<rootDir>/__mocks__/@react-native-community/slider.tsx',
  },
};
