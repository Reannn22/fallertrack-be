# FallerTrack Backend API Documentation

A comprehensive API for elderly fall detection and navigation system.

## 🌟 Core Features

- Real-time fall detection and emergency notifications
- GPS tracking and geofencing
- Turn-by-turn navigation with voice guidance
- Emergency services location finder
- API activity logging

## 🧮 Algorithms & Technologies

### Navigation System

- **Google Routes API**: Turn-by-turn navigation with Bayesian algorithm for route optimization
- **Haversine Formula**: Calculate distances between coordinates
- **Point-to-Line Distance**: Track user position relative to route
- **Bearing Calculation**: Determine direction of movement

### Location Services

- **Google Geocoding API**: Convert coordinates to readable addresses
- **Snap-to-Road**: Keep users on valid walking paths
- **Places API**: Find emergency services nearby

### Speech Generation

- **Google Cloud Text-to-Speech API**:
  - Voice: en-US-Chirp3-HD-Achernar
  - High-definition neural voice
  - MP3 encoding format

### Fall Detection

- **Distance Threshold Algorithm**: Monitor sudden position changes
- **Geofence Monitoring**: Track within home radius
- **Emergency Response System**: Prioritize nearest services

## 🔌 Google API Integration

### 1. Routes API

- Compute walking routes
- Real-time navigation instructions
- Distance & duration calculations
- Walking-optimized paths

### 2. Maps Platform

- Geocoding API: Location name lookup
- Places API: Emergency services search
- Distance Matrix API: Service proximity calculation
- Snap-to-Roads: Path correction

### 3. Cloud Services

- Text-to-Speech API: Voice navigation
- Cloud Storage: Audio file hosting
- Cloud Functions: Serverless operations
- IAM & Security: API access control

### 4. Firebase Services

- Firestore: Real-time data storage
- Authentication: Service account access
- Cloud Functions: Event triggers
- Analytics: Usage tracking

## 📚 API Reference

Base URLs:

- Development: `https://fallertrack-api-755271153581.us-west2.run.app`
- Production: `https://fallertrack.my.id`

### Authentication and Headers

Currently uses Firebase Admin SDK for backend authentication. All requests should include:

```http
Content-Type: application/json
```

### Endpoints Overview

#### Home Management

- POST `/api/home` - Initialize home location
- GET `/api/home` - Get current home location
- DELETE `/api/home` - Delete home location

#### Navigation & Tracking

- POST `/api/current-distance` - Update current location
- GET `/api/current-distance` - Get latest location
- POST `/api/navigation` - Generate navigation route
- GET `/api/text-to-speech` - Get latest voice instruction
- POST `/api/text-to-speech` - Generate text-to-speech audio
- GET `/api/speech/:filename` - Download speech file

#### Emergency Features

- POST `/api/fall-detection` - Report fall incident
- GET `/api/fall-notification` - Get fall details
- POST `/api/sos-location` - Search emergency locations by custom radius
- POST `/api/alert` - Send emergency alert
- GET `/api/alert` - Get latest alert status

#### Analytics & Logs

- POST `/api/time-length` - Calculate navigation duration
- GET `/api/log-history` - Get all API activity logs
- DELETE `/api/log-history` - Clear all API logs
- POST `/api/summarize` - Get AI summary of recent logs

### API Commands Summary

#### Home Management APIs

✅ POST `/api/home` - Initialize home location
✅ GET `/api/home` - Get current home location
✅ DELETE `/api/home` - Delete home location

#### Navigation & Tracking APIs

✅ POST `/api/current-distance` - Update current location
✅ GET `/api/current-distance` - Get latest location
✅ POST `/api/navigation` - Generate navigation route
✅ GET `/api/text-to-speech` - Get latest voice instruction
✅ POST `/api/text-to-speech` - Generate text-to-speech audio
✅ GET `/api/speech/:filename` - Download speech file

#### Emergency APIs

✅ POST `/api/fall-detection` - Report fall incident
✅ GET `/api/fall-notification` - Get fall details
✅ POST `/api/sos-location` - Search emergency locations
✅ POST `/api/alert` - Send emergency alert
✅ GET `/api/alert` - Get latest alert status

#### Analytics APIs

✅ POST `/api/time-length` - Calculate navigation duration
✅ GET `/api/log-history` - Get all API activity logs
✅ DELETE `/api/log-history` - Clear all API logs
✅ POST `/api/summarize` - Get AI summary of recent logs

### Detailed API Documentation

#### 1. Home Location Management

**Initialize Home Location (POST)**

Request:

```bash
curl -X POST https://fallertrack.my.id/api/home \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -5.364489256035376,
    "longitude": 105.30535841177186,
    "radius": 200
  }'
```

Success Response (200):

```json
{
  "latitude": -5.339191011843987,
  "longitude": 105.32698391811313,
  "radius": 200,
  "nama": "M86G+8QH Jatimulyo, South Lampung Regency, Lampung, Indonesia",
  "time": "2025-05-10T16:13:35.009Z"
}
```

Error Response (400):

```json
{
  "error": "Home location already initialized. Only one initialization is allowed."
}
```

**Get Home Location (GET)**

Request:

```bash
curl -X GET https://fallertrack.my.id/api/home \
  -H "Content-Type: application/json" \
  -d '{}'
```

Success Response (200):

```json
{
  "latitude": -5.339191011843987,
  "longitude": 105.32698391811313,
  "radius": 200,
  "nama": "M86G+8QH Jatimulyo, South Lampung Regency, Lampung, Indonesia",
  "time": "2025-05-10T16:13:53.593Z"
}
```

Error Response (404):

```json
{
  "error": "No home location found",
  "time": "2025-05-10T16:13:53.593Z"
}
```

**Delete Home Location (DELETE)**

Request:

```bash
curl -X DELETE https://fallertrack.my.id/api/home \
  -H "Content-Type: application/json" \
  -d '{}'
```

Success Response (200):

```json
{
  "message": "Home location deleted successfully",
  "time": "2025-05-10T16:14:53.593Z"
}
```

Error Response (500):

```json
{
  "error": "Error deleting home location: [error details]",
  "time": "2025-05-10T16:14:53.593Z"
}
```

#### 2. Navigation System

**Update Current Location**

Request:

```bash
curl -X POST https://fallertrack.my.id/api/current-distance \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -5.3388405,
    "longitude": 105.32688089999999
  }'
```

Response:

```json
{
  "isWithinRange": true,
  "distance": 41,
  "unit": "meters",
  "navigationStatus": {
    "onRoute": true,
    "distanceToEnd": 0,
    "currentStep": 2,
    "totalSteps": 4,
    "instruction": "Turn right\nDestination will be on the left"
  },
  "time": "2025-05-11T10:10:31.748Z"
}
```

**Get Voice Navigation**

Request:

```bash
curl -X GET https://fallertrack.my.id/api/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:

```json
{
  "text": "Turn right",
  "downloadUrl": "/api/speech/speech_1746904498149.mp3",
  "time": "2025-05-10T19:14:58.139Z",
  "meters": 36,
  "status": "on_route"
}
```

**Generate Text to Speech**

Request:

```bash
curl -X POST https://fallertrack.my.id/api/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Turn right at the next intersection"
  }'
```

Response:

```json
{
  "message": "Speech generated successfully",
  "downloadUrl": "/api/speech/speech_1747020523618.mp3",
  "publicUrl": "https://storage.googleapis.com/lansiasuara/speech_1747020523618.mp3",
  "text": "Turn right at the next intersection",
  "timestamp": "2025-05-12T03:28:48.365Z"
}
```

**Get Speech File**

Request:

```bash
curl -X GET https://fallertrack.my.id/api/speech/speech_1747020523618.mp3 \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:

```text
Binary audio file (MP3)
Content-Type: audio/mpeg
Content-Disposition: attachment; filename="speech_1747020523618.mp3"
```

### Navigation Route Management

**Generate Navigation Route (POST)**

Request:

```bash
curl -X POST https://fallertrack.my.id/api/navigation \
  -H "Content-Type: application/json" \
  -d '{}'
```

Success Response (200):

```json
{
  "routes": [
    {
      "legs": [
        {
          "steps": [
            {
              "navigationInstruction": {
                "instructions": "Head south",
                "maneuver": "TURN_SOUTH"
              },
              "startLocation": {
                "latLng": {
                  "latitude": -5.3388405,
                  "longitude": 105.32688089999999
                }
              },
              "endLocation": {
                "latLng": {
                  "latitude": -5.339191011843987,
                  "longitude": 105.32698391811313
                }
              }
            }
          ],
          "travelAdvisory": {
            "speedReadingIntervals": []
          },
          "duration": "2m",
          "distance": {
            "meters": 150
          }
        }
      ]
    }
  ],
  "geocodingResults": [],
  "time": "2025-05-11T10:10:31.748Z"
}
```

Error Response (404):

```json
{
  "error": "No current location found. Please submit location first.",
  "time": "2025-05-11T10:10:31.748Z"
}
```

Error Response (500):

```json
{
  "error": "Error computing navigation: HTTP error! status: 400",
  "time": "2025-05-11T10:10:31.748Z"
}
```

**Navigation Test Cases for "Head south" Instruction**

1. At Start Point (Case 1: TRIGGER_DISTANCE ≤ 10m):

```bash
curl -X POST https://fallertrack.my.id/api/current-distance \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -5.3388405,
    "longitude": 105.32688089999999
  }'
```

Response:

```json
{
  "isWithinRange": true,
  "distance": 41,
  "unit": "meters",
  "navigationStatus": {
    "onRoute": true,
    "distanceToEnd": 36,
    "currentStep": 0,
    "totalSteps": 1,
    "instruction": "Head south"
  },
  "time": "2025-05-12T06:22:20.239Z",
  "instruction": "Head south"
}
```

2. On Route (Case 2: ON_ROUTE_MARGIN ≤ 20m):

```bash
curl -X POST https://fallertrack.my.id/api/current-distance \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -5.338997,
    "longitude": 105.326847
  }'
```

Response:

```json
{
  "isWithinRange": true,
  "distance": 41,
  "unit": "meters",
  "navigationStatus": {
    "onRoute": true,
    "distanceToEnd": 18,
    "currentStep": 0,
    "totalSteps": 1,
    "instruction": "Move forward 18 meters"
  },
  "time": "2025-05-12T06:22:25.239Z",
  "instruction": "Move forward 18 meters"
}
```

3. Off Route (Distance > 20m):

```bash
curl -X POST https://fallertrack.my.id/api/current-distance \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -5.338997,
    "longitude": 105.327100
  }'
```

Response:

```json
{
  "isWithinRange": true,
  "distance": 41,
  "unit": "meters",
  "navigationStatus": null,
  "time": "2025-05-12T06:22:30.239Z",
  "instruction": "You are not on the navigation route"
}
```

These test cases cover:

1. Starting point of navigation
2. Mid-route point within margin
3. Off-route point

#### 3. Emergency System

**Report Fall Detection (POST)**

Request:

```bash
curl -X POST http://localhost:8080/api/fall-detection \
  -H "Content-Type: application/json" \
  -d '{
    "accelero": [90.8, 0.1, 0.1],
    "gyro": [100.1, 0.2, 0.3]
  }'
```

Response (Fall Detected due to high acceleration and gyroscope values):

```json
{
  "accelero": [90.8, 0.1, 0.1],
  "gyro": [100.1, 0.2, 0.3],
  "status": true,
  "message": "Elderly person has fallen",
  "timestamp": "2024-01-20T06:22:30.239Z"
}
```

Notes:

- Fall is detected when either:
  - Total acceleration exceeds 20 m/s²
  - OR absolute gyroscope value exceeds 100 rad/s
- accelero: Array of [x, y, z] acceleration values in m/s²
- gyro: Array of [x, y, z] angular velocity values in rad/s

**Get Fall Notification Status (GET)**

Request:

```bash
curl -X GET https://fallertrack.my.id/api/fall-notification \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:

```json
{
  "fallStatus": {
    "detected": true,
    "timestamp": "2024-01-20T06:22:30.239Z",
    "location": {
      "latitude": -5.3388405,
      "longitude": 105.32688089999999,
      "address": "M86G+8QH Jatimulyo"
    }
  },
  "elderlyInfo": {
    "name": "Mrs. Edith Thompson",
    "age": 75,
    "medicalConditions": ["Hypertension", "Diabetes"],
    "emergencyContact": {
      "name": "John Thompson",
      "phone": "+1234567890",
      "relationship": "Son",
      "notificationStatus": {
        "call": true,
        "message": true,
        "timestamp": "2024-01-20T06:22:35.123Z"
      }
    }
  },
  "emergencyResponse": {
    "status": "active",
    "servicesNotified": [
      {
        "name": "Posko Damkar Kec. Jatiagung",
        "responding": true,
        "eta": "5 mins"
      }
    ],
    "lastUpdate": "2024-01-20T06:22:40.567Z"
  }
}
```

**Find Emergency Services**

Request:

```bash
curl -X POST https://fallertrack.my.id/api/sos-location \
  -H "Content-Type: application/json" \
  -d '{
    "radius": 5000
  }'
```

Response:

```json
{
  "results": [
    {
      "name": "Posko Damkar Kec. Jatiagung",
      "vicinity": "M75V+W9P, Jalan P. Senopati, Jatimulyo",
      "rating": 5
    }
  ],
  "status": "OK"
}
```

**Send Emergency Alert (POST)**

Request:

```bash
curl -X POST https://fallertrack.my.id/api/alert \
  -H "Content-Type: application/json" \
  -d '{
    "sos": true
  }'
```

Success Response:

```json
{
  "sos": true,
  "time": "2025-05-14T09:04:37.859Z"
}
```

Error Response (400):

```json
{
  "error": "SOS must be boolean (true/false)",
  "time": "2025-05-14T09:04:37.859Z"
}
```

**Get Latest Alert Status (GET)**

Request:

```bash
curl -X GET https://fallertrack.my.id/api/alert
```

Success Response:

```json
{
  "sos": true,
  "time": "2025-05-14T09:04:37.859Z"
}
```

Error Response (404):

```json
{
  "error": "No alerts found",
  "time": "2025-05-14T09:04:37.859Z"
}
```

#### 4. Analytics & Logging

**Get Navigation Duration**

Request:

```bash
curl -X POST https://fallertrack.my.id/api/time-length \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:

```json
{
  "time_arrival": "2025-05-11T09:44:04.720Z",
  "time_end": "2025-05-11T10:10:32.108Z",
  "hour": "26 minutes 27 seconds",
  "time": "2025-05-11T10:27:07.969Z"
}
```

**Get API Activity Logs**

Request:

```bash
curl -X GET https://fallertrack.my.id/api/log-history \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:

```json
{
  "logs": [
    {
      "id": "log123",
      "endpoint": "/api/current-distance",
      "requestData": {
        "latitude": -5.3388405,
        "longitude": 105.32688089999999
      },
      "responseData": {
        "isWithinRange": true,
        "distance": 41
      },
      "timestamp": "2025-05-11T10:27:07.969Z"
    }
  ],
  "count": 1,
  "time": "2025-05-11T10:27:09.969Z"
}
```

**Get Log Summary**

Request:

```bash
curl -X POST https://fallertrack.my.id/api/summarize \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 50,
    "startDate": "2025-05-11T00:00:00Z",
    "endDate": "2025-05-12T00:00:00Z"
  }'
```

Response:

```json
{
  "text": "Log Analysis Summary:\n\n1. Activity Overview: Multiple requests to /api/current-distance endpoint showing user tracking over time.\n\n2. Navigation Status: User appears to be within range (109 meters) of target location but consistently off the navigation route.\n\n3. Pattern: 8 logged entries, with 7 showing off-route status and 1 showing successful on-route navigation with 'Head south' instruction.\n\n4. Time Range: Activities logged between May 11-12, 2025, with most recent activity at 03:43:53 UTC."
}
```

**Get Log History with Filters**

Request:

```bash
curl -X GET "https://fallertrack.my.id/api/log-history?endpoint=/api/current-distance&limit=2&startDate=2025-05-11T00:00:00Z&endDate=2025-05-12T00:00:00Z" \
  -H "Content-Type: application/json"
```

Response:

```json
{
  "logs": [
    {
      "id": "log123",
      "endpoint": "/api/current-distance",
      "requestData": {
        "latitude": -5.3388405,
        "longitude": 105.32688089999999
      },
      "responseData": {
        "isWithinRange": true,
        "distance": 41
      },
      "timestamp": "2025-05-11T10:27:07.969Z"
    },
    {
      "id": "log124",
      "endpoint": "/api/current-distance",
      "requestData": {
        "latitude": -5.340154,
        "longitude": 105.326813
      },
      "responseData": {
        "isWithinRange": true,
        "distance": 109
      },
      "timestamp": "2025-05-11T09:27:08.969Z"
    }
  ],
  "count": 2,
  "time": "2025-05-11T10:27:09.969Z"
}
```

Query Parameters:

- `endpoint`: Filter logs by specific API endpoint
- `limit`: Maximum number of logs to return (default: 50)
- `startDate`: Filter logs from this date (ISO format)
- `endDate`: Filter logs until this date (ISO format)

**Clear API Logs**

Request:

```bash
curl -X DELETE https://fallertrack.my.id/api/log-history \
  -H "Content-Type: application/json" \
  -d '{}'
```

Response:

```json
{
  "message": "Successfully deleted 14 log entries",
  "time": "2025-05-11T12:49:29.680Z"
}
```

**Calculate Navigation Duration (POST/GET)**

Both POST and GET methods available with same response format.

Request:

```bash
# Using POST
curl -X POST http://localhost:8080/api/time-length

# Using GET
curl -X GET http://localhost:8080/api/time-length
```

Success Response:

```json
{
  "time_arrival": "2025-05-14T03:30:24.974Z",
  "time_end": "2025-05-14T03:30:31.631Z",
  "hour": "6 seconds",
  "time": "2025-05-14T03:30:38.147Z"
}
```

Error Response (404 - No Home):

```json
{
  "error": "No home location found",
  "time": "2025-05-14T03:30:38.147Z"
}
```

Error Response (404 - No Navigation):

```json
{
  "error": "Navigation not yet completed",
  "time": "2025-05-14T03:30:38.147Z"
}
```

Note: Time calculation starts when home location is set and ends when destination is reached.

**Example Usage Flow:**

1. Set Home Location:

```bash
curl -X POST http://localhost:8080/api/home \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -5.364489256035376,
    "longitude": 105.30535841177186,
    "radius": 200
  }'
```

Response:

```json
{
  "latitude": -5.364489256035376,
  "longitude": 105.30535841177186,
  "radius": 200,
  "nama": "J8P4+645 Harapan Jaya, Bandar Lampung City, Lampung, Indonesia",
  "time": "2025-05-14T03:30:24.974Z"
}
```

2. Update Location (Reaching Destination):

```bash
curl -X POST http://localhost:8080/api/current-distance \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -5.36453602,
    "longitude": 105.30535929999999
}'
```

Response:

```json
{
  "latitude": -5.36453602,
  "longitude": 105.30535929999999,
  "isWithinRange": true,
  "distance": 5,
  "unit": "meters",
  "navigationStatus": {
    "onRoute": true,
    "distanceToEnd": 1,
    "currentStep": 2,
    "totalSteps": 3,
    "instruction": "Turn left onto Jl. Nangka III\nDestination will be on the right"
  },
  "time": "2025-05-14T03:30:31.631Z",
  "instruction": "Turn left onto Jl. Nangka III\nDestination will be on the right"
}
```

3. Get Time Length:

```bash
curl -X GET http://localhost:8080/api/time-length
```

Response:

```json
{
  "time_arrival": "2025-05-14T03:30:24.974Z",
  "time_end": "2025-05-14T03:30:31.631Z",
  "hour": "6 seconds",
  "time": "2025-05-14T03:30:38.147Z"
}
```

### Current Location Management

**Update Current Location (POST)**

Request:

```bash
curl -X POST https://fallertrack.my.id/api/current-distance \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -5.3388405,
    "longitude": 105.32688089999999
  }'
```

Success Response (200):

```json
{
  "isWithinRange": true,
  "distance": 41,
  "unit": "meters",
  "navigationStatus": {
    "onRoute": true,
    "distanceToEnd": 150,
    "currentStep": 1,
    "totalSteps": 4,
    "instruction": "Move forward 150 meters"
  },
  "time": "2025-05-11T10:10:31.748Z",
  "instruction": "Move forward 150 meters"
}
```

Error Response (400):

```json
{
  "error": "Latitude and longitude are required",
  "time": "2025-05-11T10:10:31.748Z"
}
```

**Get Latest Location (GET)**

Request:

```bash
curl -X GET https://fallertrack.my.id/api/current-distance \
  -H "Content-Type: application/json" \
  -d '{}'
```

Success Response (200):

```json
{
  "isWithinRange": true,
  "distance": 41,
  "unit": "meters",
  "time": "2025-05-11T10:10:31.748Z"
}
```

Error Response (404):

```json
{
  "error": "No current location found",
  "time": "2025-05-11T10:10:31.748Z"
}
```

## 🔧 Error Handling

All errors return this format:

```json
{
  "error": "Error description",
  "time": "ISO timestamp"
}
```

Common status codes:

- 200: Success
- 400: Bad Request (invalid input)
- 404: Resource Not Found
- 500: Server Error

## 🚀 Rate Limiting

Currently no rate limiting implemented.

## 📦 Dependencies

- Express.js
- Firebase Admin SDK
- Google Cloud Text-to-Speech
- Google Routes API
- Google Places API
- Google Cloud Storage
  - Bucket: `fallertrack-navigation-sound`
  - Type: Multi-region (US)
  - Access: Public
  - Used for storing navigation audio files

## 📦 Project Structure

## 🚀 Deployment

### Google Cloud Platform Setup

1. **Prerequisites**

   - Google Cloud account
   - gcloud CLI installed
   - Docker installed

2. **Build & Deploy**

   ```bash
   # Build container
   docker build -t fallertrack-backend .

   # Tag for Google Container Registry
   docker tag fallertrack-backend gcr.io/fallertrack/fallertrack-backend

   # Push to Container Registry
   docker push gcr.io/fallertrack/fallertrack-backend

   # Deploy to Cloud Run
   gcloud run deploy fallertrack-backend \
     --image gcr.io/fallertrack/fallertrack-backend \
     --platform managed \
     --region us-west2 \
     --allow-unauthenticated
   ```

3. **Environment Variables**

   - Set in Cloud Run service
   - Required variables:
     ```
     NODE_ENV=production
     GOOGLE_CLOUD_PROJECT=fallertrack
     GOOGLE_APPLICATION_CREDENTIALS=/credentials/service-account.json
     ```

4. **Monitoring**
   - Cloud Monitoring dashboard
   - Cloud Logging for application logs
   - Error Reporting for exception tracking
   - Cloud Trace for latency analysis

## 📊 Google Technologies & APIs Usage Analysis

### Core Google APIs (7)

1. Google Routes API

   - Used in: `/routes/navigation-and-tracking/navigation.js`
   - Purpose: Computing walking routes and navigation paths

2. Google Maps Geocoding API

   - Used in: `/routes/home-management/home.js`
   - Purpose: Converting coordinates to human-readable addresses

3. Google Places API

   - Used in: `/routes/emergency-features/sos-location.js`
   - Purpose: Finding nearby emergency services

4. Google Cloud Text-to-Speech API

   - Used in: `/routes/navigation-and-tracking/text-to-speech.js`
   - Purpose: Converting navigation instructions to voice

5. Google Cloud Storage API

   - Used in: `/routes/navigation-and-tracking/text-to-speech.js`
   - Purpose: Storing and serving audio files
   - Bucket: 'fallertrack-navigation-sound'

6. Google Cloud IAM API

   - Used in: `/config/getAccessToken.js`
   - Purpose: Managing service account authentication

7. Google AI Gemini API
   - Used in: `/routes/analytics-and-logs/summarize.js`
   - Purpose: Generating AI summaries of API logs

### Firebase Services (4)

1. Firebase Admin SDK

   - Used in: `/config/firebase.js`
   - Purpose: Main Firebase initialization and management

2. Firestore Database

   - Used across multiple files
   - Collections used:
     - homes
     - current_locations
     - navigation_data
     - speech_files
     - latest_tts
     - fall_notifications
     - api_logs
     - log_summaries

3. Firebase Authentication

   - Used for service account authentication
   - Credentials in: `/credentials/` folder

4. Firebase Cloud Storage
   - Used for backup audio file storage

### Total Google Technologies Used: 11

- 7 Core Google APIs
- 4 Firebase Services

### Authentication Methods

1. Service Account Authentication
   - Used for: Google Cloud & Firebase services
   - Location: `/credentials/`
   - Files:
     - `gesp-459003-aabf1ee34b71.json` (Google Cloud)
     - `fallertrack-database-firebase-adminsdk-fbsvc-5ed10a17ab.json` (Firebase)

### API Keys Used

1. Google Maps Platform API Key

   - Used for: Routes, Geocoding, Places APIs
   - Key: AIzaSyCXqDSiV34e_jSIURIbxavQ2sf6ESSG7xc

2. Google AI API Key
   - Used for: Gemini API
   - Key: AIzaSyA1A9io37cq5eems1avvVRUC6RhD2w91CQ

Note: All service accounts and API keys shown in this documentation should be treated as sensitive information and should be properly secured in production environments.
