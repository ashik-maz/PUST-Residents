const express = require('express');
const router = express.Router();
const { 
  getStudentDues, 
  processPayment, 
  getPaymentHistory,
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel
} = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dues/:studentId', protect, getStudentDues);
router.post('/pay', protect, authorize('Provost', 'Co-Provost'), processPayment);
router.get('/history/:studentId', protect, getPaymentHistory);

// SSLCommerz
router.post('/init', protect, authorize('Student'), initPayment);
router.post('/success/:tranId', paymentSuccess);
router.post('/fail/:tranId', paymentFail);
router.post('/cancel/:tranId', paymentCancel);

module.exports = router;
