/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
export default {
  rootDir: "..",
  clearMocks: true,
  resetMocks: true,
  collectCoverageFrom: ["src/**/*.ts", "!**/test/**", "!**/node_modules/**"],
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageReporters: ["html", "text", "text-summary", "lcov"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleDirectories: ["node_modules"],
  modulePathIgnorePatterns: ["<rootDir>/dist/"],
  preset: "ts-jest",
  reporters: ["default"],
  setupFiles: ["<rootDir>/test-setup/setup.ts"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  testPathIgnorePatterns: ["<rootDir>/node_modules/"],
  verbose: true,
};
