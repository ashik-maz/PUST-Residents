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

module.exports = {
  getStudentDues,
  processPayment,
  getPaymentHistory,
};
