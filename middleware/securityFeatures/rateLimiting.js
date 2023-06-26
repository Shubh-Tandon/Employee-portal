const rateLimit = require("express-rate-limit");

// Create rate limiter middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // maximum of 2 requests per windowMs
});

module.exports = limiter;
