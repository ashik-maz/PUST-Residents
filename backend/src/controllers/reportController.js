const Transaction = require('../models/Transaction');
const User = require('../models/User');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// @desc    Get dashboard analytics
// @route   GET /api/reports/analytics
// @access  Private/Provost/Co-Provost
const getAnalytics = async (req, res) => {
  try {
    let matchQuery = {};

    // If Provost/Co-Provost, filter by their hall
    if (req.user.role === 'Provost' || req.user.role === 'Co-Provost') {
      if (req.user.hallName) {
        // Need to find students in that hall first
        const studentIds = await User.find({ role: 'Student', hallName: req.user.hallName }).select('_id');
        matchQuery.student = { $in: studentIds.map(s => s._id) };
      }
    }

    const totalTransactions = await Transaction.countDocuments(matchQuery);
    
    const totalRevenueResult = await Transaction.aggregate([
      { $match: matchQuery },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const recentPayments = await Transaction.find(matchQuery)
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student', 'fullName studentId hallName');

    res.json({
      totalTransactions,
      totalRevenue: totalRevenueResult[0] ? totalRevenueResult[0].total : 0,
      recentPayments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get report by date range
// @route   GET /api/reports/range
// @access  Private/Provost/Co-Provost
const getReportByRange = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let matchQuery = {
      paymentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    // If Provost/Co-Provost, filter by their hall
    if (req.user.role === 'Provost' || req.user.role === 'Co-Provost') {
      if (req.user.hallName) {
        const studentIds = await User.find({ role: 'Student', hallName: req.user.hallName }).select('_id');
        matchQuery.student = { $in: studentIds.map(s => s._id) };
      }
    }

    const payments = await Transaction.find(matchQuery).populate('student', 'fullName studentId hallName');

    const totalAmount = payments.reduce((acc, curr) => acc + curr.amount, 0);

    res.json({
      count: payments.length,
      totalAmount,
      payments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Export report to Excel
// @route   GET /api/reports/export
// @access  Private/Provost/Co-Provost
const exportReport = async (req, res) => {
  const { startDate, endDate } = req.query;

  try {
    let matchQuery = {
      paymentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    // If Provost/Co-Provost, filter by their hall
    if (req.user.role === 'Provost' || req.user.role === 'Co-Provost') {
      if (req.user.hallName) {
        const studentIds = await User.find({ role: 'Student', hallName: req.user.hallName }).select('_id');
        matchQuery.student = { $in: studentIds.map(s => s._id) };
      }
    }

    const payments = await Transaction.find(matchQuery).populate('student', 'fullName studentId hallName department session');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payment Report');

    worksheet.columns = [
      { header: 'Transaction ID', key: 'transactionId', width: 25 },
      { header: 'Student Name', key: 'fullName', width: 25 },
      { header: 'Student ID', key: 'studentId', width: 15 },
      { header: 'Hall Name', key: 'hallName', width: 20 },
      { header: 'Amount', key: 'amount', width: 15 },
      { header: 'Payment Date', key: 'paymentDate', width: 20 },
    ];

    payments.forEach(payment => {
      worksheet.addRow({
        transactionId: payment.transactionId,
        fullName: payment.student.fullName,
        studentId: payment.student.studentId,
        hallName: payment.student.hallName,
        amount: payment.amount,
        paymentDate: payment.paymentDate.toLocaleString(),
      });
    });

    const dir = path.join(__dirname, '../../uploads/reports');
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `report_${Date.now()}.xlsx`;
    const filePath = path.join(dir, filename);

    await workbook.xlsx.writeFile(filePath);

    res.download(filePath);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAnalytics,
  getReportByRange,
  exportReport,
};
