const User = require('../models/User');
const Due = require('../models/Due');
const Settings = require('../models/Settings');

// @desc    Add new resident
// @route   POST /api/residents
// @access  Private/Provost/Co-Provost
const addResident = async (req, res) => {
  const { fullName, studentId, department, session, hallName, roomNumber, allottedDate, password } = req.body;

  try {
    const userExists = await User.findOne({ studentId });

    if (userExists) {
      return res.status(400).json({ message: 'Resident with this Student ID already exists' });
    }

    const user = await User.create({
      fullName,
      studentId,
      department,
      session,
      hallName,
      roomNumber,
      allottedDate,
      role: 'Student',
      password: password || 'student', // Default initial password
    });

    if (user) {
      // Calculate initial admission fees + first month's rent
      const settings = await Settings.findOne();
      if (settings) {
        let totalDue = 0;
        
        // 1. One-time Admission Fees
        if (settings.admissionFees) {
          totalDue += (settings.admissionFees.idCardFee || 0) +
                      (settings.admissionFees.hallSecurityDeposit || 0) +
                      (settings.admissionFees.hallDevelopmentFee || 0);
        }

        // 2. First Month's Rent and Establishment (from monthlyFees)
        const hallMonthly = settings.monthlyFees[hallName];
        if (hallMonthly) {
          totalDue += (hallMonthly.seatRent || 0) + (hallMonthly.establishment || 0);
        }
        
        if (totalDue > 0) {
          await Due.create({
            student: user._id,
            amount: totalDue,
            type: 'Admission',
            description: `Admission Fees + First Month Rent (${hallName})`,
            month: new Date(allottedDate).getMonth() + 1,
            year: new Date(allottedDate).getFullYear(),
          });
        }
      }

      res.status(201).json(user);
    } else {
      res.status(400).json({ message: 'Invalid resident data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all residents
// @route   GET /api/residents
// @access  Private/Provost/Co-Provost
const getResidents = async (req, res) => {
  try {
    let query = { role: 'Student' };

    // If Provost or Co-Provost, filter by their hall
    if (req.user.role === 'Provost' || req.user.role === 'Co-Provost') {
      if (req.user.hallName) {
        query.hallName = req.user.hallName;
      }
    }

    const residents = await User.find(query).sort({ createdAt: -1 });
    res.json(residents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get resident by ID
// @route   GET /api/residents/:id
// @access  Private/Provost/Co-Provost/Student
const getResidentById = async (req, res) => {
  try {
    const resident = await User.findById(req.params.id);
    if (resident) {
      res.json(resident);
    } else {
      res.status(404).json({ message: 'Resident not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update resident
// @route   PUT /api/residents/:id
// @access  Private/Provost/Co-Provost
const updateResident = async (req, res) => {
  try {
    const resident = await User.findById(req.params.id);

    if (resident) {
      resident.fullName = req.body.fullName || resident.fullName;
      resident.department = req.body.department || resident.department;
      resident.session = req.body.session || resident.session;
      resident.hallName = req.body.hallName || resident.hallName;
      resident.roomNumber = req.body.roomNumber || resident.roomNumber;
      resident.status = req.body.status || resident.status;

      const updatedResident = await resident.save();
      res.json(updatedResident);
    } else {
      res.status(404).json({ message: 'Resident not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addResident,
  getResidents,
  getResidentById,
  updateResident,
};
