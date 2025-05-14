# Requirement Documentation

## 1.1. User Requirements

1. Home Location Management

   - Elderly can initialize home location through the System
   - Elderly can view their registered home location through the System
   - Elderly can delete home location through the System
   - Elderly cannot register multiple home locations simultaneously through the System
   - Elderly must have one registered home location in the System
   - Elderly can update home location through the System
   - Elderly must receive location name in Plus Code format through the System
   - Elderly must have GPS coordinate validation within Indonesia region through the System

2. Location Tracking

   - Elderly can send current location updates through the System
   - Elderly can view their current location through the System
   - Elderly must enable location services to use tracking features
   - System must update Elderly location data periodically
   - Elderly can view distance from home location through the System
   - Elderly must have all location updates logged to database through the System
   - Elderly location tracking must use Point-to-Line algorithm for route adherence through the System

3. Navigation Features

   - Elderly can generate navigation routes to home through the System
   - Elderly can receive voice instructions for navigation through the System
   - Elderly can download instruction audio files through the System
   - Elderly can access real-time navigation guidance through the System
   - Elderly can view estimated time of arrival through the System
   - Elderly can view navigation steps through the System

   - Elderly can receive re-routing suggestions when off-route through the System
   - Elderly must receive navigation updates within 20 meters margin through the System
   - Elderly can continue navigation after connection loss through the System
   - Elderly must be notified when moving off-route beyond 20 meters through the System
   - Elderly must receive turn-by-turn voice guidance in HD quality through the System
   - Elderly must receive distance updates in meters through the System
   - Elderly must receive automated navigation recalculation when lost through the System
   - Elderly must have navigation arrival time recorded through the System
   - Elderly must have voice navigation use high-definition audio quality through the System

4. Emergency Features

   - Elderly can report fall incidents through the System
   - Elderly can view fall incident details through the System
   - Elderly can search for nearby emergency services through the System
   - Elderly can set custom radius for emergency location search through the System
   - Elderly can send emergency alerts through the System
   - Elderly can view latest emergency alert status through the System
   - Elderly can view fall incident history through the System
   - Elderly fall detection must trigger when acceleration exceeds 24.5 m/s² through the System
   - Elderly fall alerts must include medical conditions through the System
   - Elderly emergency contacts must receive automated notifications through the System
   - System must track emergency service response times
   - Elderly must receive emergency service ETA updates through the System
   - Emergency contacts must receive location details with fall notifications through the System
   - Emergency contacts must receive real-time status updates through the System
   - Elderly must have emergency alerts support both true/false states through the System
   - Elderly must have all fall incidents recorded with accelerometer data through the System
   - Elderly must have emergency contact notification status tracked through the System

5. Analytics Features

   - Elderly can view navigation duration through the System
   - Elderly can access activity history through the System
   - Elderly can clear activity history through the System
   - Elderly can view AI-based activity summaries through the System
   - Elderly can filter activity history by date through the System
   - Elderly can view navigation completion rate through the System
   - Elderly can access fall incident statistics through the System
   - Elderly must receive log summaries in natural language through the System
   - Elderly can filter logs by specific API endpoints through the System
   - Elderly must have activity logs stored with endpoint details through the System
   - Elderly must have logs accessible by endpoint filtering through the System

## 1.2. System Requirements

1. Technical Stack

   - System must use Node.js with Express.js framework for backend
   - System must use Firebase for database management
   - System must integrate with Google Maps Platform
   - System must use Google Cloud Text-to-Speech
   - System must use Google Routes API for navigation
   - System must use Google Geocoding API for coordinate conversion
   - System must use Google Places API for location search
   - System must use Firebase Admin SDK for authentication
   - System must use Google Cloud Storage for audio storage
   - System must use Google AI Gemini for log analysis

2. Infrastructure

   - Production Deployment:

     - System must be deployed to Vercel for production environment
     - System must configure Vercel project settings
     - System must set up custom domain on Vercel
     - System must enable Vercel Edge Network CDN
     - System must configure Vercel environment variables

   - Development Deployment:

     - System must be deployed on Google Cloud Platform
     - System must use Cloud Run for containerization
     - System must use Cloud Storage for audio files
     - System must use Cloud Build for CI/CD
     - System must use Cloud Monitoring for performance tracking
     - System must configure separate development domain

   - Deployment Features:
     - System must implement zero-downtime deployments
     - System must enable automatic HTTPS
     - System must configure CI/CD for both platforms
     - System must implement staging environments
     - System must maintain deployment logs
     - System must configure automatic rollbacks
     - System must implement health checks

3. Security

   - System must secure Google Cloud credentials
   - System must secure Firebase credentials
   - System must encrypt sensitive data
   - System must validate user input
   - System must implement error handling
   - System must log all API activities

4. Development

   - System must be developed using Agile methodology
   - System must use Git for version control
   - System must be tested using Jest
   - System must be tested using Postman
   - System must use Notion for project management

5. Data Processing

   - System must update location data every 5 seconds
   - System must calculate distances using Haversine Formula
   - System must use Bayesian algorithm for route optimization
   - System must implement Point-to-Line distance for route adherence
   - System must use bearing calculations for direction guidance
   - System must maintain data consistency during offline periods
   - System must handle concurrent location updates
   - System must process accelerometer and gyroscope data for fall detection
   - System must implement geofencing for home radius monitoring
   - System must store navigation audio files in MP3 format
   - System must use en-US-Chirp3-HD-Achernar voice for instructions
   - System must implement distance thresholds:
     - TRIGGER_DISTANCE: ≤ 10 meters to trigger next navigation instruction
     - ROUTE_SEGMENT_DISTANCE: Distance between current location and nearest route segment
     - OFF_ROUTE_DISTANCE: Current location not within 20 meters of any route segment
   - System must categorize fall detection based on:
     - Acceleration threshold: 24.5 m/s² (2.5g)
     - Gyroscope data analysis
     - Location change patterns
   - System must format addresses using Google Plus Codes
   - System must validate coordinates within Indonesia region
   - System must maintain session state for navigation
   - System must implement emergency threshold:
     - Fall detection: > 20 m/s² acceleration or > 100 rad/s angular velocity
   - System must track API response times
   - System must support both manual and automated navigation recalculation
   - System must maintain chronological order for all logs and analytics
   - System must provide human-readable duration formats through the System
   - System must maintain chronological order of all logged activities

6. Performance
   - System must respond within 500ms for critical endpoints
   - System must handle multiple concurrent navigation sessions
   - System must optimize audio file delivery
   - System must implement caching for frequently accessed data
   - System must maintain real-time data synchronization
   - System must handle connection interruptions gracefully
   - System must optimize for Vercel Edge Network
   - System must implement serverless functions optimization
   - System must configure regional deployments
   - System must implement CDN caching strategies
   - System must limit log retention based on time or entry count
   - System must implement query parameters for log filtering
   - System must compress audio files for efficient delivery
   - System must implement request timeout handling
