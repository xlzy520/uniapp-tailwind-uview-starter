module.exports = {
  root: true,
  extends: ['plugin:vue/essential', 'eslint:recommended', 'prettier'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  env: {
    browser: true,
    es6: true,
    node: true,
    jest: true,
  },
  plugins: ['vue'],
  rules: {
    'no-unused-vars': 'off',
    'no-use-before-define': 'off',
    'no-shadow': 'off',
    camelcase: 'off',
    'no-magic-numbers': [
      'error',
      {
        enforceConst: true,
        ignore: [-1, 0, 1],
        ignoreArrayIndexes: true,
      },
    ],
    'no-warning-comments': [
      'warn',
      {
        terms: ['todo', 'fixme', 'feat', 'perf'],
        location: 'anywhere',
      },
    ],
    'func-names': ['error', 'as-needed'],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'arrow-parens': 'off',
    'prefer-object-spread': 'off',
    'max-classes-per-file': 'off',
    'no-redeclare': 'off',
  },
  globals: {
    window: true,
    document: true,
    App: true,
    Page: true,
    Component: true,
    Behavior: true,
    wx: true,
    worker: true,
    getApp: true,
    uni: true,
    uniCloud: true,
  },
};
