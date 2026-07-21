export default {
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { configFile: './babel.config.json' }],
  },
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testMatch: [
    '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/StarRatingApp/components/__tests__/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
