module.exports = {
	clearMocks: true,
	restoreMocks: true,
	resetModules: true,
	testEnvironment: "node",
	testPathIgnorePatterns: ["<rootDir>/node_modules"],
	collectCoverageFrom: ["src/**/*"],
	coverageReporters: ["json", "lcov", "json-summary", "text"],
	coverageThreshold: {
		global: {
			statements: 50,
			branches: 50,
			functions: 50,
			lines: 50
		}
	}
};