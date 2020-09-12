module.exports = {
  root: true,
  extends: ['eslint-config-vue-prettier-airbnb-ro'],
  rules: {
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'no-unused-vars': 'warn',
  },
};
