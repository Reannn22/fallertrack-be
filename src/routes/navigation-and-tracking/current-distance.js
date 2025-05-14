const express = require('express');
const router = express.Router();
const admin = require('../../config/firebase');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const db = admin.firestore();

// Add coordinate normalization helper
function roundCoordinate(coord) {
  return parseFloat(coord.toFixed(6));
}

// Add bearing calculation helper
function calculateBearing(lat1, lon1, lat2, lon2) {
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const y = Math.sin(Δλ) * Math.cos(φ2);
  const x = Math.cos(φ1) * Math.sin(φ2) -
           Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
  
  const θ = Math.atan2(y, x);
  const bearing = (θ * 180 / Math.PI + 360) % 360;
  
  return bearing;
}

// Add point-on-segment check helper
function isPointOnSegment(lat, lon, startLat, startLon, endLat, endLon, margin) {
  const distanceToSegment = getDistanceFromLine(lat, lon, startLat, startLon, endLat, endLon);
  const distanceToStart = calculateDistance(lat, lon, startLat, startLon);
  const distanceToEnd = calculateDistance(lat, lon, endLat, endLon);
  const segmentLength = calculateDistance(startLat, startLon, endLat, endLon);

  return distanceToSegment <= margin && 
         (distanceToStart + distanceToEnd) <= (segmentLength + margin);
}

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
           Math.cos(φ1) * Math.cos(φ2) *
           Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // Distance in meters
}

// Helper function for point-to-line distance
function getDistanceFromLine(pointLat, pointLon, lineStartLat, lineStartLon, lineEndLat, lineEndLon) {
  const A = pointLat - lineStartLat;
  const B = pointLon - lineStartLon;
  const C = lineEndLat - lineStartLat;
  const D = lineEndLon - lineStartLon;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  let param = -1;

  if (lenSq !== 0) {
    param = dot / lenSq;
  }

  let xx, yy;

  if (param < 0) {
    xx = lineStartLat;
    yy = lineStartLon;
  } else if (param > 1) {
    xx = lineEndLat;
    yy = lineEndLon;
  } else {
    xx = lineStartLat + param * C;
    yy = lineStartLon + param * D;
  }

  return calculateDistance(pointLat, pointLon, xx, yy);
}

// Update helper function for navigation request
async function requestNavigation(latitude, longitude) {
  try {
    if (!process.env.NAVIGATION_API_URL) {
      throw new Error('NAVIGATION_API_URL environment variable is not configured');
    }
    
    const response = await fetch(`${process.env.NAVIGATION_API_URL}/api/navigation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        origin: { latitude, longitude }
      })
    });
    return await response.json();
  } catch (error) {
    console.error('Error requesting navigation:', error);
    return null;
  }
}

// Update current location endpoint
router.post('/', async (req, res) => {
  const startTime = Date.now();
  
  try {
    const { latitude, longitude } = req.body;
    console.log('Received coordinates:', { latitude, longitude });

    if (!latitude || !longitude) {
      return res.status(400).json({ 
        error: 'Latitude and longitude are required' 
      });
    }

    // Get latest navigation data
    const navSnapshot = await db.collection('navigation_data')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (navSnapshot.empty) {
      return res.status(400).json({
        error: 'No navigation route found. Please request navigation first.',
        time: new Date().toISOString()
      });
    }

    const navData = navSnapshot.docs[0].data();
    const steps = navData.routes[0].legs[0].steps;
    
    const TRIGGER_DISTANCE = 10; // meters
    
    // Calculate ON_ROUTE_MARGIN based on current navigation step distances
    let ON_ROUTE_MARGIN = 0;
    steps.forEach(step => {
      const stepDistance = calculateDistance(
        step.startLocation.latLng.latitude,
        step.startLocation.latLng.longitude,
        step.endLocation.latLng.latitude,
        step.endLocation.latLng.longitude
      );
      ON_ROUTE_MARGIN = Math.max(ON_ROUTE_MARGIN, stepDistance);
    });
    // Add 20% buffer to the margin
    ON_ROUTE_MARGIN = Math.ceil(ON_ROUTE_MARGIN * 1.2);

    // Find current closest step
    let closestStep = null;
    let minDistance = Infinity;
    let currentStepIndex = -1;

    // Check each step to find the closest one
    steps.forEach((step, index) => {
      const distanceToSegment = getDistanceFromLine(
        latitude, longitude,
        step.startLocation.latLng.latitude,
        step.startLocation.latLng.longitude,
        step.endLocation.latLng.latitude,
        step.endLocation.latLng.longitude
      );

      if (distanceToSegment < minDistance) {
        minDistance = distanceToSegment;
        closestStep = step;
        currentStepIndex = index;
      }
    });

    // Calculate distances for the closest step
    const distanceToSegment = getDistanceFromLine(
      latitude, longitude,
      closestStep.startLocation.latLng.latitude,
      closestStep.startLocation.latLng.longitude,
      closestStep.endLocation.latLng.latitude,
      closestStep.endLocation.latLng.longitude
    );

    const distanceToStart = calculateDistance(
      latitude, longitude,
      closestStep.startLocation.latLng.latitude,
      closestStep.startLocation.latLng.longitude
    );

    const distanceToEnd = calculateDistance(
      latitude, longitude,
      closestStep.endLocation.latLng.latitude,
      closestStep.endLocation.latLng.longitude
    );

    let navigationStatus = null;

    // Case 1: At the end point of current step
    if (distanceToEnd <= TRIGGER_DISTANCE) {
      navigationStatus = {
        onRoute: true,
        distanceToEnd: Math.round(distanceToEnd),
        currentStep: currentStepIndex,
        totalSteps: steps.length,
        instruction: currentStepIndex < steps.length - 1 
          ? steps[currentStepIndex + 1].navigationInstruction.instructions 
          : closestStep.navigationInstruction.instructions
      };
    }
    // Case 2: At start of current step
    else if (distanceToStart <= TRIGGER_DISTANCE) {
      navigationStatus = {
        onRoute: true,
        distanceToEnd: Math.round(distanceToEnd),
        currentStep: currentStepIndex,
        totalSteps: steps.length,
        instruction: closestStep.navigationInstruction.instructions
      };
    }
    // Case 3: On route segment
    else if (distanceToSegment <= ON_ROUTE_MARGIN) {
      navigationStatus = {
        onRoute: true,
        distanceToEnd: Math.round(distanceToEnd),
        currentStep: currentStepIndex,
        totalSteps: steps.length,
        instruction: `Move forward ${Math.round(distanceToEnd)} meters`
      };
    }

    // Get home data and calculate distance
    const homeDoc = await db.collection('homes').doc('current').get();
    if (!homeDoc.exists) {
      return res.status(404).json({ 
        error: 'No home location found',
        time: new Date().toISOString()
      });
    }

    const home = homeDoc.data();
    const distanceToHome = calculateDistance(
      latitude, longitude,
      home.latitude, home.longitude
    );

    // Store current location
    await db.collection('current_locations').add({
      latitude,
      longitude,
      distance: Math.round(distanceToHome),
      isWithinRange: distanceToHome <= home.radius,
      navigationStatus,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    let result = {
      latitude,
      longitude,
      isWithinRange: distanceToHome <= home.radius,
      distance: Math.round(distanceToHome),
      unit: 'meters',
      navigationStatus,
      time: new Date().toISOString(),
      instruction: navigationStatus?.instruction || "Lost, press button to return to home"
    };

    // Save arrival time if destination is reached
    if (navigationStatus?.instruction && navigationStatus.instruction.includes('Destination will be on')) {
      const timestamp = admin.firestore.Timestamp.now();
      await db.collection('arrival_times').doc('current').set({
        timestamp: timestamp,
        time: timestamp.toDate().toISOString(),
        latitude,
        longitude,
        instruction: navigationStatus.instruction
      });

      // Wait for timestamp to be saved before requesting time-length
      await new Promise(resolve => setTimeout(resolve, 500));

      // Automatically post time-length calculation
      try {
        const timeResponse = await fetch(`${req.protocol}://${req.get('host')}/api/time-length`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        const timeResult = await timeResponse.json();
        console.log('Time-length response:', timeResult);
      } catch (error) {
        console.error('Error posting time-length:', error);
      }
    }

    // Automatically request new navigation if user is lost
    if (!navigationStatus || result.instruction === "Lost, press button to return to home") {
      try {
        const response = await fetch(`${req.protocol}://${req.get('host')}/api/navigation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude: latitude,
            longitude: longitude
          })
        });

      } catch (error) {
        console.error('Error requesting new navigation:', error);
      }
    }

    // Add logging before sending response
    await db.collection('logs').add({
      type: 'current-distance',
      endpoint: '/api/current-distance',
      method: 'POST',
      requestBody: { latitude, longitude },
      responseBody: result,
      result: {
        isWithinRange: result.isWithinRange,
        distance: result.distance,
        navigationStatus: result.navigationStatus
      },
      status: 'success',
      responseTime: Date.now() - startTime,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    res.json(result);

  } catch (error) {
    // Log error
    await db.collection('logs').add({
      type: 'current-distance',
      endpoint: '/api/current-distance',
      method: 'POST',
      requestBody: req.body,
      status: 'error',
      error: error.message,
      responseTime: Date.now() - startTime,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error checking distance: ' + error.message,
      time: new Date().toISOString()
    });
  }
});

// Get latest current location
router.get('/', async (req, res) => {
  try {
    const snapshot = await db.collection('current_locations')
      .orderBy('timestamp', 'desc')
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ 
        error: 'No current location found',
        time: new Date().toISOString()
      });
    }

    const location = snapshot.docs[0].data();
    res.json({
      latitude: location.latitude,
      longitude: location.longitude,
      isWithinRange: location.isWithinRange,
      distance: location.distance,
      unit: 'meters',
      navigationStatus: location.navigationStatus,
      instruction: location.navigationStatus?.instruction || "Lost, press button to return to home",
      time: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error details:', error);
    res.status(500).json({ 
      error: 'Error fetching current location: ' + error.message,
      time: new Date().toISOString()
    });
  }
});

module.exports = router;
