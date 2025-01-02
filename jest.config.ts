import type { Config } from "jest";

const config: Config = {
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

export default config;
