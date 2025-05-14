const { describe, it, expect, beforeEach } = require('@jest/globals');
const { searchEmergencyLocations } = require('../../src/controllers/sosLocation.controller');

// Mock dependencies
jest.mock('../../src/utils/location.utils');
jest.mock('../../src/utils/api.utils');
jest.mock('../../src/logs/error.logger');
jest.mock('../../src/logs/emergency.logger');

// Import all mocked functions
const { getCurrentLocation } = require('../../src/utils/location.utils');
const { makeGoogleApiRequest } = require('../../src/utils/api.utils');
const { logError } = require('../../src/logs/error.logger');
const { logEmergencySearch } = require('../../src/logs/emergency.logger');

describe('SOS Location Controller', () => {
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = { query: {}, body: {} };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  it('should return 400 when radius is missing', async () => {
    await searchEmergencyLocations(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: 'Radius is required'
    }));
  });

  it('should return places data on successful search', async () => {
    const mockLocation = { latitude: 1, longitude: 1 };
    const mockPlaces = { results: [{name: 'Test Hospital'}] };
    
    mockReq.query.radius = '10000';
    getCurrentLocation.mockResolvedValueOnce(mockLocation);
    makeGoogleApiRequest.mockResolvedValueOnce(mockPlaces);

    await searchEmergencyLocations(mockReq, mockRes);

    expect(getCurrentLocation).toHaveBeenCalled();
    expect(makeGoogleApiRequest).toHaveBeenCalledWith(mockLocation, '10000');
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith(mockPlaces);
  });

  it('should handle errors appropriately', async () => {
    const error = new Error('Test error');
    mockReq.query.radius = '10000';
    getCurrentLocation.mockRejectedValue(error);

    await searchEmergencyLocations(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Error fetching SOS locations')
    }));
    expect(logError).toHaveBeenCalledWith(error, expect.objectContaining({
      action: 'searchEmergencyLocations',
      radius: '10000'
    }));
  });
});
