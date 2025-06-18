module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    moduleFileExtensions: ['ts', 'js'],
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testMatch: ['**/*.spec.ts'],
    moduleNameMapper: {
      '^src/(.*)$': '<rootDir>/src/$1',
      '^src/entities/(.*)$': '<rootDir>/src/entities/$1',
    },
  };