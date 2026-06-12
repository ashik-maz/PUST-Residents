const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  const { fullName, studentId, department, session, hallName, roomNumber, allottedDate, role, password } = req.body;

  try {
    const userExists = await User.findOne({ studentId });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      studentId,
      department,
      session,
      hallName,
      roomNumber,
      allottedDate,
      role,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        studentId: user.studentId,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  const { studentId, password } = req.body;

  try {
    const user = await User.findOne({ studentId }).select('+password');

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        studentId: user.studentId,
        role: user.role,
        hallName: user.hallName,
        department: user.department,
        session: user.session,
        roomNumber: user.roomNumber,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid student ID or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      fullName: user.fullName,
      studentId: user.studentId,
      department: user.department,
      session: user.session,
      hallName: user.hallName,
      roomNumber: user.roomNumber,
      allottedDate: user.allottedDate,
      role: user.role,
      status: user.status,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.fullName = req.body.fullName || user.fullName;
      user.department = req.body.department || user.department;
      user.session = req.body.session || user.session;
      user.roomNumber = req.body.roomNumber || user.roomNumber;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        studentId: updatedUser.studentId,
        role: updatedUser.role,
        hallName: updatedUser.hallName,
        department: updatedUser.department,
        session: updatedUser.session,
        roomNumber: updatedUser.roomNumber,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
