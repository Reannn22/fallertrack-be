/**
 * Jest Global Test Configuration
 * Sets up test environment and global utilities
 */

// Load environment variables from .env file
require('dotenv').config();

// Import test utilities
const expect = require('expect');
const { jest } = require('@jest/globals');

// Make test utilities available globally
global.expect = expect;
global.jest = jest;

// Configure test timeouts (30 seconds)
jest.setTimeout(30000);

/**
 * Global Test Lifecycle Hooks
 */

// Run before all test suites
beforeAll(() => {
  // Setup code that runs before all tests
});

// Run after all test suites
afterAll(() => {
  // Cleanup code that runs after all tests
});
