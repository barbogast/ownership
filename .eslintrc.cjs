// eslint-disable-next-line no-undef
module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",

  // Enabling the @typesciprt-eslint parserService will cause an eslint error in this file (.eslintrc.cjs)
  // Ignoring this file is the recommended solution (https://typescript-eslint.io/linting/troubleshooting/#i-get-errors-telling-me-eslint-was-configured-to-run--however-that-tsconfig-does-not--none-of-those-tsconfigs-include-this-file)
  ignorePatterns: [".eslintrc.cjs"],

  parserOptions: { ecmaVersion: "latest", sourceType: "module", project: true },
  plugins: ["react-refresh"],
  rules: {
    "react-refresh/only-export-components": "warn",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { destructuredArrayIgnorePattern: "^_" },
    ],
    "@typescript-eslint/no-floating-promises": "error",
  },
};
