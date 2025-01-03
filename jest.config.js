const config = {
    moduleFileExtensions: ["js", "json"],
    moduleNameMapper: {
      "^@/(.*)$": "<rootDir>/dist/$1",
    },
    rootDir: "./dist",
    testEnvironment: "node",
    testRegex: ".*\\.test\\.js$",
  };
  
  module.exports = config;
  