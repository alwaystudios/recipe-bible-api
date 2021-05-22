module.exports = {
  clearMocks: true,
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/test'],
  coverageDirectory: './coverage',
  collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
  coveragePathIgnorePatterns: ['clients*'],
  maxWorkers: 2,
}
