export default {
  testEnvironment: 'node',
  transform: {},
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'controllers/**/*.js',
    'utils/**/*.js',
    'config/autenticacao.js',
    'config/seeder.js',
    '!node_modules/**',
    '!coverage/**'
  ],
  coverageReporters: ['text', 'lcov', 'clover'],
  testMatch: ['**/__tests__/**/*.test.js'],
  extensionsToTreatAsEsm: []
};
