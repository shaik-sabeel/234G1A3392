const axios = require('axios');

// Supported values as per evaluation guidelines
const STACKS = ['backend', 'frontend'];
const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal'];

const BACKEND_PACKAGES = [
  'cache',
  'controller',
  'cron_job',
  'db',
  'domain',
  'handler',
  'repository',
  'route',
  'service'
];

const FRONTEND_PACKAGES = [
  'api',
  'component',
  'hook',
  'page',
  'state',
  'style'
];

const SHARED_PACKAGES = [
  'auth',
  'config',
  'middleware',
  'utils'
];

// Configuration state for the logger package
let apiBaseUrl = 'http://4.224.186.213/evaluation-service';
let authToken = '';

/**
 * Configure the logging library.
 * Allows setting the authentication token and changing the API base URL.
 * 
 * @param {Object} config
 * @param {string} config.token - The authorization bearer token
 * @param {string} [config.baseUrl] - Optional override for the evaluation server API base URL
 */
function configure(config = {}) {
  if (config.token) {
    authToken = config.token;
  }
  if (config.baseUrl) {
    apiBaseUrl = config.baseUrl;
  }
}

/**
 * Sends a log entry to the evaluation server's protected logging endpoint.
 * 
 * @param {string} stack - 'backend' or 'frontend'
 * @param {string} level - 'debug', 'info', 'warn', 'error', or 'fatal'
 * @param {string} pkg - The package name (e.g. 'controller', 'middleware', etc.)
 * @param {string} message - Descriptive log message
 * @returns {Promise<Object>} The API response log status or logs details
 */
async function Log(stack, level, pkg, message) {
  // Input validation
  const lowerStack = String(stack).toLowerCase();
  const lowerLevel = String(level).toLowerCase();
  const lowerPkg = String(pkg).toLowerCase();

  // Validate stack
  if (!STACKS.includes(lowerStack)) {
    throw new Error(`Invalid log stack: "${stack}". Must be one of: ${STACKS.join(', ')}`);
  }

  // Validate level
  if (!LEVELS.includes(lowerLevel)) {
    throw new Error(`Invalid log level: "${level}". Must be one of: ${LEVELS.join(', ')}`);
  }

  // Validate package based on stack constraints
  const isShared = SHARED_PACKAGES.includes(lowerPkg);
  const isValidBackendPkg = lowerStack === 'backend' && BACKEND_PACKAGES.includes(lowerPkg);
  const isValidFrontendPkg = lowerStack === 'frontend' && FRONTEND_PACKAGES.includes(lowerPkg);

  if (!isShared && !isValidBackendPkg && !isValidFrontendPkg) {
    let allowed = [];
    if (lowerStack === 'backend') {
      allowed = [...BACKEND_PACKAGES, ...SHARED_PACKAGES];
    } else {
      allowed = [...FRONTEND_PACKAGES, ...SHARED_PACKAGES];
    }
    throw new Error(
      `Invalid package "${pkg}" for stack "${stack}". Must be one of: ${allowed.join(', ')}`
    );
  }

  if (!message || typeof message !== 'string') {
    throw new Error('Log message must be a non-empty string');
  }

  // Prepare payload
  const payload = {
    stack: lowerStack,
    level: lowerLevel,
    package: lowerPkg,
    message
  };

  // Perform API call
  try {
    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await axios.post(`${apiBaseUrl}/logs`, payload, {
      headers,
      timeout: 10000 // 10 second timeout
    });

    return response.data;
  } catch (error) {
    // If request fails, log details to stderr and throw
    const errMsg = error.response?.data?.message || error.response?.data || error.message;
    console.error(`[Logging Middleware Error] Failed to post log to server: ${errMsg}`);
    throw new Error(`Failed to send log to server: ${errMsg}`);
  }
}

module.exports = {
  configure,
  Log
};
