module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
  testMatch: [
    '**/test/**/*.simulate.(js|jsx|ts|tsx)',
    '**/test/**/*.simulate.test.(js|jsx|ts|tsx)',
    '**/test/**/*.e2e.(js|jsx|ts|tsx)'
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'node',
  watchman: false,
  setupFilesAfterEnv: ['<rootDir>/test/jest.setup.ts'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: false,
    },
  },
  reporters: ['default'],
  verbose: true,
};
