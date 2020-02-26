module.exports = {
  moduleFileExtensions: ["js", "jsx", "json", "ts", "tsx"],
  transform: {
    "^.+\\.tsx?$": "babel-jest"
  },
  transformIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    "^@app/(.*)": "<rootDir>/app/$1",
    "^@test/(.*)$": "<rootDir>/tests/$1"
  },
  watchPlugins: ["jest-watch-typeahead/filename", "jest-watch-typeahead/testname"],
  testEnvironment: "node",
  roots: ["app/", "tests/"],
  resetMocks: true
}
