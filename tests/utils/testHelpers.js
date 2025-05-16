/**
 * Test Utility Functions
 * Provides mock objects and helper functions for testing
 */

/**
 * Mock Firestore instance
 * Simulates database operations for testing
 */
const mockFirestore = {
  collection: jest.fn().mockReturnThis(),  // Chain collection calls
  doc: jest.fn().mockReturnThis(),        // Chain document calls
  add: jest.fn(),                         // Mock document creation
  set: jest.fn(),                         // Mock document updates
  get: jest.fn(),                         // Mock document retrieval
  orderBy: jest.fn().mockReturnThis(),    // Chain query ordering
  limit: jest.fn().mockReturnThis()       // Chain query limits
};

/**
 * Create mock Express request object
 * @param {Object} params - Query parameters to include
 * @returns {Object} Mock request object
 */
const createMockRequest = (params = {}) => ({
  query: params,
});

/**
 * Create mock Express response object
 * @returns {Object} Mock response object with status and json methods
 */
const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  return res;
};

/**
 * Sample test data
 * Used for consistent test scenarios
 */
const mockData = {
  currentLocation: {
    latitude: 1.23,
    longitude: 4.56,
    timestamp: new Date().toISOString()
  },
  googlePlacesResponse: {
    results: [
      {
        name: 'Test Hospital',
        vicinity: 'Test Street',
        geometry: {
          location: { lat: 1.23, lng: 4.56 }
        },
        types: ['hospital']
      }
    ],
    status: 'OK'
  }
};

// Export utilities
module.exports = {
  mockFirestore,
  createMockRequest,
  createMockResponse,
  mockData
};
