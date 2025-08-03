// https://docs.expo.dev/guides/using-eslint/
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { base, react } = require("eslint-config-expo");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tseslint = require("typescript-eslint");

module.exports = [
  {
    ...base,
    ignores: ["dist/*", "node_modules/*"],
  },
  {
    ...react,
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Add any custom rules here
    },
  },
  ...tseslint.configs.recommended,
];
