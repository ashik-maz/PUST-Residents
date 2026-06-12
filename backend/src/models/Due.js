const mongoose = require('mongoose');

const dueSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['Admission', 'Monthly'],
    required: true,
  },
  month: {
    type: Number, // 1-12
  },
  year: {
    type: Number,
  },
  description: {
    type: String,
  },
  isPaid: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Due', dueSchema);
