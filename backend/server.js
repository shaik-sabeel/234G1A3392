const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const logger = require('logging-middleware');

const { getAccessToken } = require('./utils/auth');
const { getPriorityNotifications } = require('./utils/priority');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://4.224.186.213/evaluation-service';

// Middlewares
app.use(cors());
app.use(express.json());

/**
 * Express Middleware to ensure the Logging Middleware is configured with a valid token
 * and injects the `Log` function into the request object.
 */
async function loggingContextMiddleware(req, res, next) {
  try {
    const token = await getAccessToken();
    // Configure the reusable logger package with the active token
    logger.configure({
      token,
      baseUrl: TEST_SERVER_URL
    });
    
    // Attach Log function to the request object for easy access in route handlers
    req.Log = logger.Log;
    next();
  } catch (error) {
    console.error('[Logger Config Error] Failed to configure logging middleware:', error.message);
    // Fallback to a mock/console log function if auth fails during setup, to prevent request crashes
    req.Log = async (stack, level, pkg, msg) => {
      console.log(`[FALLBACK LOG] [${stack}] [${level}] [${pkg}] ${msg}`);
    };
    next();
  }
}

// Apply the logging context middleware to all routes
app.use(loggingContextMiddleware);

/**
 * GET /api/notifications
 * Exposes sorted priority notifications to the client
 * Query parameters:
 *   - n: number of notifications to return (default: 10)
 *   - readIds: comma-separated list of read notification IDs to filter out (optional)
 */
app.get('/api/notifications', async (req, res) => {
  const n = parseInt(req.query.n, 10) || 10;
  const readIdsQuery = req.query.readIds || '';
  const readIds = readIdsQuery ? readIdsQuery.split(',') : [];

  try {
    // 1. Log request arrival
    await req.Log('backend', 'info', 'route', `Received GET request for top ${n} priority notifications`);

    // 2. Obtain token to call external API
    await req.Log('backend', 'debug', 'auth', 'Requesting test server authorization token');
    const token = await getAccessToken();

    // 3. Call the protected notification API
    await req.Log('backend', 'info', 'service', 'Fetching notifications from the test server');
    
    const response = await axios.get(`${TEST_SERVER_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      timeout: 10000
    });

    const notifications = response.data?.notifications || [];
    await req.Log('backend', 'debug', 'service', `Fetched ${notifications.length} raw notifications from source`);

    // 4. Process notifications through the sorting algorithm
    await req.Log('backend', 'debug', 'utils', 'Sorting and selecting top priority notifications');
    const priorityList = getPriorityNotifications(notifications, n, readIds);

    // 5. Log success
    await req.Log('backend', 'info', 'controller', `Returning ${priorityList.length} prioritized notifications successfully`);

    res.status(200).json({
      success: true,
      count: priorityList.length,
      notifications: priorityList
    });

  } catch (error) {
    // Log failure using the mandatory logger
    const errMsg = error.response?.data?.message || error.message;
    await req.Log('backend', 'error', 'handler', `Error fetching priority notifications: ${errMsg}`);

    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to retrieve priority notifications',
      error: errMsg
    });
  }
});

/**
 * POST /api/logs
 * Proxies logging calls from the frontend or test scripts to the Test Server.
 */
app.post('/api/logs', async (req, res) => {
  const { stack, level, package: pkg, message } = req.body;

  try {
    // Use the injected Log function to write logs
    const result = await req.Log(stack, level, pkg, message);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

// Basic Health Check
app.get('/health', async (req, res) => {
  try {
    await req.Log('backend', 'info', 'route', 'Health check ping received');
    res.status(200).json({ status: 'OK', service: 'notification_app_be' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`Notification Backend Server running on port ${PORT}`);
  console.log(`==================================================`);
});
