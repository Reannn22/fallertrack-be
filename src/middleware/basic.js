/**
 * Basic Express Middleware Configuration
 * Handles JSON parsing and HTTPS redirection
 */

// Import Express framework
const express = require('express');

/**
 * Basic middleware array containing:
 * 1. JSON parser for request bodies
 * 2. HTTPS redirect for production environment
 */
const basicMiddleware = [
  // Parse JSON request bodies
  express.json(),
  
  // Handle HTTPS redirection
  (req, res, next) => {
    // Allow HTTP in development or if already secure
    if (req.secure || process.env.NODE_ENV !== 'production') {
      next();
    } else {
      // Redirect to HTTPS in production
      res.redirect(`https://${req.headers.host}${req.url}`);
    }
  }
];

// Export middleware array
module.exports = basicMiddleware;
