module.exports = {
	preset: 'ts-jest/presets/js-with-ts',
	testEnvironment: 'node',
	roots: ['<rootDir>/src', '<rootDir>/test'],
	coverageDirectory: './coverage',
	collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
	coveragePathIgnorePatterns: ['logger.ts', 'dynamoClient.ts', 'snsClient.ts', 'getClients.ts', 'subjectTypes.ts'],
	maxWorkers: 2,
}
