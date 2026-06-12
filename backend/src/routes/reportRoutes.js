const express = require('express');
const router = express.Router();
const { getAnalytics, getReportByRange, exportReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics', protect, authorize('Provost', 'Co-Provost'), getAnalytics);
router.get('/range', protect, authorize('Provost', 'Co-Provost'), getReportByRange);
router.get('/export', protect, authorize('Provost', 'Co-Provost'), exportReport);

module.exports = router;
