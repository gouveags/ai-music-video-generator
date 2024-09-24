module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  extends: ["eslint:recommended", "airbnb-base", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
  },
  rules: {
    "no-console": "off",
    "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "consistent-return": "off",
    "no-param-reassign": "off",
  },
  prettier: {
    singleQuote: true,
    trailingComma: "es5",
    printWidth: 80,
    tabWidth: 2,
  },
};
