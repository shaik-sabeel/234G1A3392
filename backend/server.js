const express = require('express');
const cors = require('cors');
const axios = require('axios');
const dotenv = require('dotenv');
const logger = require('logging-middleware');

const { getAccessToken } = require('./utils/auth');
const { getPriorityNotifications } = require('./utils/priority');
const { mockNotifications } = require('./utils/mockData');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const TEST_SERVER_URL = process.env.TEST_SERVER_URL || 'http://4.224.186.213/evaluation-service';

app.use(cors());
app.use(express.json());

async function loggingContextMiddleware(req, res, next) {
  try {
    const token = await getAccessToken();
    logger.configure({
      token,
      baseUrl: TEST_SERVER_URL
    });
    req.Log = logger.Log;
    next();
  } catch (error) {
    console.error('Logger init failed:', error.message);
    req.Log = async (stack, level, pkg, msg) => {
      console.log(`[FALLBACK] [${stack}] [${level}] [${pkg}] ${msg}`);
    };
    next();
  }
}

app.use(loggingContextMiddleware);

app.get('/api/profile', (req, res) => {
  res.status(200).json({
    name: process.env.FULL_NAME || 'Sabeel',
    rollNo: process.env.ROLL_NO || '234G1A3392',
    email: process.env.EMAIL || '234g1a3392@srit.ac.in'
  });
});

app.get('/api/notifications/all', async (req, res) => {
  const { limit, page, notification_type } = req.query;
  try {
    await req.Log('backend', 'info', 'route', `GET all page=${page || 1} type=${notification_type || 'all'}`);

    const token = await getAccessToken();
    let responseData;

    if (token === 'mock-developer-token') {
      await req.Log('backend', 'info', 'service', 'Mock all updates request');
      let filtered = [...mockNotifications];
      if (notification_type) {
        filtered = filtered.filter(n => n.Type?.toLowerCase() === notification_type.toLowerCase());
      }
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const start = (pageNum - 1) * limitNum;
      const paginated = filtered.slice(start, start + limitNum);

      responseData = {
        notifications: paginated,
        total: filtered.length,
        page: pageNum,
        limit: limitNum
      };
    } else {
      const params = {};
      if (limit) params.limit = limit;
      if (page) params.page = page;
      if (notification_type) params.notification_type = notification_type;

      const response = await axios.get(`${TEST_SERVER_URL}/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` },
        params,
        timeout: 10000
      });
      responseData = response.data;
    }

    res.status(200).json({
      success: true,
      ...responseData
    });
  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    await req.Log('backend', 'error', 'handler', `Fetch all error: ${errMsg}`);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: errMsg
    });
  }
});

app.get('/api/notifications', async (req, res) => {
  const n = parseInt(req.query.n, 10) || 10;
  const readIdsQuery = req.query.readIds || '';
  const readIds = readIdsQuery ? readIdsQuery.split(',') : [];

  try {
    await req.Log('backend', 'info', 'route', `GET notifications limit=${n}`);

    const token = await getAccessToken();
    let notifications = [];

    if (token === 'mock-developer-token') {
      await req.Log('backend', 'info', 'service', 'Using fallback mock notification dataset');
      notifications = mockNotifications;
    } else {
      const response = await axios.get(`${TEST_SERVER_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      });
      notifications = response.data?.notifications || [];
    }

    const priorityList = getPriorityNotifications(notifications, n, readIds);
    await req.Log('backend', 'info', 'controller', `Returned ${priorityList.length} items`);

    res.status(200).json({
      success: true,
      count: priorityList.length,
      notifications: priorityList
    });

  } catch (error) {
    const errMsg = error.response?.data?.message || error.message;
    await req.Log('backend', 'error', 'handler', `Fetch error: ${errMsg}`);
    res.status(error.response?.status || 500).json({
      success: false,
      message: 'Failed to retrieve notifications',
      error: errMsg
    });
  }
});

app.post('/api/logs', async (req, res) => {
  const { stack, level, package: pkg, message } = req.body;
  try {
    const result = await req.Log(stack, level, pkg, message);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
