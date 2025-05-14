require('dotenv').config();

const expect = require('expect');
const { jest } = require('@jest/globals');

global.expect = expect;
global.jest = jest;

// Set global test timeout
jest.setTimeout(30000);

// Add any global test setup here
beforeAll(() => {
  // Setup code that runs before all tests
});

afterAll(() => {
  // Cleanup code that runs after all tests
});
