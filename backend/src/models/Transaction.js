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
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  paymentMethod: {
    type: String,
  },
  monthRange: {
    type: String,
  },
  details: [{
    type: { type: String },
    amount: Number,
    count: Number,
  }],
  collectedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Optional for online payments
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
