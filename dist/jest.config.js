"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    // collectCoverage: true,
    // coverageDirectory: "./coverage",
    moduleFileExtensions: ["js", "ts", "json"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
    },
    preset: "ts-jest",
    rootDir: "./",
    setupFilesAfterEnv: ["./jest.setup.ts"],
    testEnvironment: "node",
    testRegex: ".*\\.test\\.ts$",
    transform: {
        "^.+\\.ts$": "ts-jest",
    },
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map