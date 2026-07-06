/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src/__tests__"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { diagnostics: false }],
  },
  clearMocks: true,
};
