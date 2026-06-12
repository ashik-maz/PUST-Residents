const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true,
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  previousDue: {
    type: Number,
    required: true,
  },
  remainingDue: {
    type: Number,
    default: 0,
  },
  paymentDate: {
    type: Date,
    default: Date.now,
  },
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  dues: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Due',
  }],
  voucherUrl: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Transaction', transactionSchema);
