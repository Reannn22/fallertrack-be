const mockFirestore = {
  collection: jest.fn().mockReturnThis(),
  doc: jest.fn().mockReturnThis(),
  add: jest.fn(),
  set: jest.fn(),
  get: jest.fn(),
  orderBy: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis()
};

const createMockRequest = (params = {}) => ({
  query: params,
});

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
  return res;
};

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

module.exports = {
  mockFirestore,
  createMockRequest,
  createMockResponse,
  mockData
};
