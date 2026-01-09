module.exports = {
  testEnvironment: 'jsdom',
  testMatch: ['**/__tests__/**/*.test.js'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/jest.setup.js'],
  testTimeout: 10000,
  rootDir: require('path').resolve(__dirname, '..')
}
