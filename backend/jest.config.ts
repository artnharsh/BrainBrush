import type { Config } from "jest";

const config: Config = {
    // Use ts-jest to run TypeScript tests directly without pre-compiling
    preset: "ts-jest",

    // Run tests in Node.js environment (not browser/jsdom)
    testEnvironment: "node",

    // Look for test files in __tests__ directories or files ending in .test.ts
    testMatch: [
        "**/src/__tests__/**/*.test.ts",
        "**/src/**/*.test.ts",
    ],

    // Module path aliases (if needed in future)
    moduleFileExtensions: ["ts", "js", "json"],

    // Don't transform node_modules (speeds up tests)
    transformIgnorePatterns: ["/node_modules/"],

    // Clear mock state between every test
    clearMocks: true,

    // Show verbose output for each test
    verbose: true,
};

export default config;
