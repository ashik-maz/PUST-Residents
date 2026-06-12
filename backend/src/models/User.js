const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a full name'],
  },
  studentId: {
    type: String,
    required: [true, 'Please add a student ID'],
    unique: true,
  },
  department: {
    type: String,
    required: [true, 'Please add a department'],
  },
  session: {
    type: String,
    required: [true, 'Please add a session'],
  },
  hallName: {
    type: String,
    required: [true, 'Please select a hall'],
    enum: ['Shadhinota Hall', 'July-6 Hall', 'Gonotontro Hall', 'Matrivasha Hall'],
  },
  roomNumber: {
    type: String,
    required: [true, 'Please add a room number'],
  },
  allottedDate: {
    type: Date,
    required: [true, 'Please add the allotted date'],
  },
  lastPaymentDate: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
  role: {
    type: String,
    enum: ['Provost', 'Co-Provost', 'Student'],
    default: 'Student',
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false,
  },
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
