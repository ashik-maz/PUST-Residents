const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Settings = require('../models/Settings');

dotenv.config({ path: '.env' });

const halls = [
  'Shadhinota Hall',
  'July-6 Hall',
  'Gonotontro Hall',
  'Matrivasha Hall'
];

const seed = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hall-payment';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing staff
    await User.deleteMany({ role: { $in: ['Provost', 'Co-Provost'] } });
    await Settings.deleteMany({});

    const users = [];

    halls.forEach((hall) => {
      const hallSlug = hall.toLowerCase().replace(/[^a-z0-9]/g, '_');
      
      // Provost
      users.push({
        fullName: `Provost - ${hall}`,
        studentId: `provost_${hallSlug}`,
        department: 'Administration',
        session: 'N/A',
        hallName: hall,
        roomNumber: 'Office',
        allottedDate: new Date(),
        role: 'Provost',
        password: 'password123',
      });

      // Assistant Provosts (Co-Provost)
      for (let i = 1; i <= 2; i++) {
        users.push({
          fullName: `Asst. Provost ${i} - ${hall}`,
          studentId: `ap${i}_${hallSlug}`,
          department: 'Administration',
          session: 'N/A',
          hallName: hall,
          roomNumber: 'Office',
          allottedDate: new Date(),
          role: 'Co-Provost',
          password: 'password123',
        });
      }
    });

    // We use insertMany but bcrypt won't work automatically with insertMany 
    // because it's a pre-save hook on the model instance.
    // However, User.create(array) DOES trigger save hooks for each document.
    await User.create(users);
    console.log(`Seeded ${users.length} staff users`);

    // Create Default Settings
    await Settings.create({
      admissionFees: {
        seatRent: 200,
        establishmentFee: 150,
        idCardFee: 100,
        hallSecurityDeposit: 400,
        hallDevelopmentFee: 2000,
      },
      monthlyFees: {
        'July-6 Hall': {
          seatRent: 200,
          establishment: 150,
        },
        'Gonotontro Hall': {
          seatRent: 200,
          establishment: 150,
        },
        'Shadhinota Hall': {
          seatRent: 150,
          establishment: 100,
        },
        'Matrivasha Hall': {
          seatRent: 150,
          establishment: 100,
        },
      },
    });
    console.log('Default settings created with user-specified fees');

    console.log('Seeding successful');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seed();
