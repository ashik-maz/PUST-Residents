const User = require('../models/User');
const Due = require('../models/Due');
const Transaction = require('../models/Transaction');
const { generateTransactionId } = require('../utils/generateId');
const { generateVoucher } = require('../services/pdfService');

// @desc    Get student dues
// @route   GET /api/payments/dues/:studentId
// @access  Private/Provost/Co-Provost/Student
const getStudentDues = async (req, res) => {
  try {
    let query = { studentId: req.params.studentId };

    // Filter by hall if Provost or Co-Provost
    if (req.user.role === 'Provost' || req.user.role === 'Co-Provost') {
      if (req.user.hallName) {
        query.hallName = req.user.hallName;
      }
    }

    const student = await User.findOne(query);
    if (!student) {
      return res.status(404).json({ message: 'Student not found or not from your hall' });
    }

    const dues = await Due.find({ student: student._id, isPaid: false });
    const totalDue = dues.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      student,
      dues,
      totalDue,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Process payment
// @route   POST /api/payments/pay
// @access  Private/Provost/Co-Provost
const processPayment = async (req, res) => {
  const { studentId, amountPaid } = req.body;

  try {
    const student = await User.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const unpaidDues = await Due.find({ student: student._id, isPaid: false });
    const totalOutstandingDue = unpaidDues.reduce((acc, curr) => acc + curr.amount, 0);

    // IMPORTANT BUSINESS RULE: No Partial Payment
    if (amountPaid !== totalOutstandingDue) {
      return res.status(400).json({
        message: 'Full due payment is required. Partial payments are not allowed.',
        requiredAmount: totalOutstandingDue,
      });
    }

    const transactionId = generateTransactionId();

    const transaction = await Transaction.create({
      transactionId,
      student: student._id,
      amount: amountPaid,
      previousDue: totalOutstandingDue,
      remainingDue: 0,
      collectedBy: req.user._id,
      dues: unpaidDues.map(d => d._id),
    });

    // Mark dues as paid
    await Due.updateMany(
      { _id: { $in: unpaidDues.map(d => d._id) } },
      { $set: { isPaid: true } }
    );

    // Update student's last payment date
    student.lastPaymentDate = new Date();
    await student.save();

    // Generate Voucher
    const voucherUrl = await generateVoucher(transaction, student);
    transaction.voucherUrl = voucherUrl;
    await transaction.save();

    res.status(201).json({
      message: 'Payment successful',
      transaction,
      voucherUrl,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get payment history
// @route   GET /api/payments/history/:studentId
// @access  Private/Provost/Co-Provost/Student
const getPaymentHistory = async (req, res) => {
  try {
    const student = await User.findOne({ studentId: req.params.studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const history = await Transaction.find({ student: student._id })
      .sort({ createdAt: -1 })
      .populate('collectedBy', 'fullName');
      
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const SSLCommerzPayment = require('sslcommerz-lts');

// @desc    Initialize SSLCommerz Payment
// @route   POST /api/payments/init
// @access  Private/Student
const initPayment = async (req, res) => {
  const { studentId } = req.body;

  try {
    const student = await User.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const unpaidDues = await Due.find({ student: student._id, isPaid: false });
    const totalAmount = unpaidDues.reduce((acc, curr) => acc + curr.amount, 0);

    if (totalAmount <= 0) {
      return res.status(400).json({ message: 'No outstanding dues found' });
    }

    const tran_id = generateTransactionId();
    
    const data = {
      total_amount: totalAmount,
      currency: 'BDT',
      tran_id: tran_id,
      success_url: `${process.env.BASE_URL}/api/payments/success/${tran_id}`,
      fail_url: `${process.env.BASE_URL}/api/payments/fail/${tran_id}`,
      cancel_url: `${process.env.BASE_URL}/api/payments/cancel/${tran_id}`,
      ipn_url: `${process.env.BASE_URL}/api/payments/ipn`,
      shipping_method: 'No',
      product_name: 'Hall Fees',
      product_category: 'Education',
      product_profile: 'general',
      cus_name: student.fullName,
      cus_email: `${student.studentId}@pust.ac.bd`,
      cus_add1: student.hallName,
      cus_city: 'Pabna',
      cus_state: 'Pabna',
      cus_postcode: '6600',
      cus_country: 'Bangladesh',
      cus_phone: '01700000000',
      cus_fax: '01700000000',
      ship_name: 'N/A',
      ship_add1: 'N/A',
      ship_city: 'N/A',
      ship_state: 'N/A',
      ship_postcode: 'N/A',
      ship_country: 'Bangladesh',
    };

    // Save temporary transaction data
    await Transaction.create({
      transactionId: tran_id,
      student: student._id,
      amount: totalAmount,
      status: 'Pending',
      dues: unpaidDues.map(d => d._id),
    });

    const sslcz = new SSLCommerzPayment(process.env.STORE_ID, process.env.STORE_PASSWORD, process.env.IS_LIVE === 'true');
    sslcz.init(data).then(apiResponse => {
      let GatewayPageURL = apiResponse.GatewayPageURL;
      res.json({ url: GatewayPageURL });
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Payment Success Callback
// @route   POST /api/payments/success/:tranId
const paymentSuccess = async (req, res) => {
  const { tranId } = req.params;
  try {
    const transaction = await Transaction.findOne({ transactionId: tranId });
    if (!transaction) return res.status(404).send('Transaction not found');

    const student = await User.findById(transaction.student);

    transaction.status = 'Completed';
    transaction.paymentDate = new Date();
    
    // Mark dues as paid
    await Due.updateMany(
      { _id: { $in: transaction.dues } },
      { $set: { isPaid: true } }
    );

    // Update student's last payment date
    student.lastPaymentDate = new Date();
    await student.save();

    // Generate Voucher
    const voucherUrl = await generateVoucher(transaction, student);
    transaction.voucherUrl = voucherUrl;
    await transaction.save();

    res.redirect(`${process.env.FRONTEND_URL}/dashboard?payment=success`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Payment Fail Callback
// @route   POST /api/payments/fail/:tranId
const paymentFail = async (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?payment=fail`);
};

// @desc    Payment Cancel Callback
// @route   POST /api/payments/cancel/:tranId
const paymentCancel = async (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}/dashboard?payment=cancel`);
};

module.exports = {
  getStudentDues,
  processPayment,
  getPaymentHistory,
  initPayment,
  paymentSuccess,
  paymentFail,
  paymentCancel,
};
