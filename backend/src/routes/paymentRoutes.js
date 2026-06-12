const express = require('express');
const router = express.Router();
const { getStudentDues, processPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dues/:studentId', protect, getStudentDues);
router.post('/pay', protect, authorize('Provost', 'Co-Provost'), processPayment);
router.get('/history/:studentId', protect, getPaymentHistory);

module.exports = router;
