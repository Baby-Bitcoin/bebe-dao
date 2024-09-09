const { rateLimit } = require("express-rate-limit");

const createRateLimiter = (maxRequests, windowMinutes) => {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: "Too many requests, please try again later.",
  });
};

module.exports = { createRateLimiter };
