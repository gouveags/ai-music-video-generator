module.exports = {
  root: true,
  env: {
    node: true,
    es2022: true,
    browser: true,
    mocha: true,
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'coverage/',
    'apps/frontend/.astro/',
    'apps/frontend/dist/',
    'apps/backend/tmp/',
    'apps/backend/storage/',
    'infra/suno-api/',
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-undef': 'error',
  },
};
