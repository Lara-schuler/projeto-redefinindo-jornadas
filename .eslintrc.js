module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: [
    'airbnb-base',
  ],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    'linebreak-style': 0,
    semi: ['error', 'always'], // Exige ponto e vírgula
    quotes: ['error', 'single'], // Exige aspas simples
    // 'no-console': 'warn', Emite um alerta ao usar console.log
  },
};
