const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Due = require('../models/Due');
const Settings = require('../models/Settings');

dotenv.config({ path: '.env' });

const maleStudents = [
  { name: 'MD.Rafiur Rahaman Yash', id: '240115', session: '2023-24' },
  { name: 'Avijit Ghosh', id: '240127', session: '2023-2024' },
  { name: 'Rakiullah Sarkar', id: '230132', session: '2022-23' },
  { name: 'Md. Jannatul Naim Jim', id: '230120', session: '2022-2023' },
  { name: 'Rakibul Hassan', id: '230116', session: '2022-2023' },
  { name: 'Md Rakibul Islam', id: '200130', session: '2019-20' },
  { name: 'MD. RAKIBUL ISLAM RAKIB', id: '220134', session: '2021-2022' },
  { name: 'Nasimul Islam', id: '230129', session: '2022-2023' },
  { name: 'Sabab Asfaq', id: '220103', session: '2021-22' },
  { name: 'Md. Sahadat Hossain', id: '250133', session: '2024-25' },
  { name: 'Md. Riyaz Ali', id: '250132', session: '2024-25' },
  { name: 'Md. Abu Rayhan', id: '220125', session: '2021-2022' },
  { name: 'Md.Muhibur Rahman Bhuiyan', id: '250108', session: '24-25' },
  { name: 'Shahid hasan fahim', id: '250125', session: '2024-2025' },
  { name: 'MD NAFIZ UDDOWLA NAKIB', id: '240240', session: '2023-24' },
  { name: 'Samin Yesar Tousib', id: '250138', session: '2024-2025' },
  { name: 'Ezazul Hoque Hemal', id: '230111', session: '2022-23' },
  { name: 'Saiful Islam', id: '210140', session: '2021-21' },
  { name: 'Md. Ashikuzz Zaman', id: '220119', session: '2021-2022' },
  { name: 'Md Sadman Hafiz Shaon', id: '220139', session: '2021-2022' },
  { name: 'Abu Johab', id: '210130', session: '2020-21' },
  { name: 'Swopnomoy Biswas', id: '210132', session: '2021-22' },
  { name: 'Khalid Hossen', id: '220133', session: '2021-22' },
  { name: 'Zahin Mahmud Daiyan', id: '250123', session: '2024-2025' },
  { name: 'Sheikh Shifat', id: '240141', session: '2023-2024' },
  { name: 'Md. Iftekar Rahman', id: '250139', session: '24-25' },
  { name: 'Md. Ibn Masud', id: '220113', session: '2021-22' },
];

const femaleStudents = [
  { name: 'Tahamina Farzana Zinnia', id: '220121', session: '2021-2022' },
  { name: 'Tamanna Yasmin', id: '210120', session: '2020-2021' },
  { name: 'Israt Jahan', id: '210116', session: '2020-2021' },
  { name: 'Miskatul Jannat', id: '220101', session: '2021-2022' },
  { name: 'Mst. Sabina Yasmin', id: '220102', session: '2021-2022' },
  { name: 'Mahfuza Parvin', id: '220104', session: '2021-2022' },
  { name: 'Arun Dhoti Kar', id: '220136', session: '2021-2022' },
  { name: 'Sajia Tabassum Arthi', id: '230101', session: '2022-2023' },
  { name: 'Sraboni Akter', id: '230134', session: '2023-2024' },
  { name: 'Moriom Khatun', id: '240129', session: '2023-2024' },
  { name: 'Fahmida Akter', id: '240139', session: '2023-2024' },
];

const seedResidents = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing students and dues
    await User.deleteMany({ role: 'Student' });
    await Due.deleteMany({});

    const settings = await Settings.findOne();
    const students = [];

    // Date configuration
    const allottedDate = new Date('2025-06-01'); // 1 year ago
    const lastPaymentDate = new Date('2026-03-31'); // Last paid March 2026

    // Helper to generate students
    const processStudents = (studentList, hallOptions) => {
      studentList.forEach((student, index) => {
        const hallName = hallOptions[index % hallOptions.length];
        students.push({
          fullName: student.name,
          studentId: student.id,
          department: 'CSE',
          session: student.session,
          hallName: hallName,
          roomNumber: `${100 + (index % 50)}`,
          allottedDate: allottedDate,
          lastPaymentDate: lastPaymentDate,
          role: 'Student',
          password: 'student',
        });
      });
    };

    processStudents(maleStudents, ['Shadhinota Hall', 'July-6 Hall']);
    processStudents(femaleStudents, ['Gonotontro Hall', 'Matrivasha Hall']);

    const createdUsers = await User.create(students);
    console.log(`Seeded ${createdUsers.length} resident students`);

    // Generate Dues for April, May, June 2026
    const dueMonths = [
      { month: 4, year: 2026, name: 'April' },
      { month: 5, year: 2026, name: 'May' },
      { month: 6, year: 2026, name: 'June' },
    ];

    const duesToCreate = [];

    for (const resident of createdUsers) {
      const hallFees = settings.monthlyFees[resident.hallName];
      const amount = (hallFees.seatRent || 0) + (hallFees.establishment || 0);

      dueMonths.forEach(dm => {
        duesToCreate.push({
          student: resident._id,
          amount,
          type: 'Monthly',
          month: dm.month,
          year: dm.year,
          description: `Monthly Fee for ${dm.name} ${dm.year}`,
        });
      });
    }

    await Due.insertMany(duesToCreate);
    console.log(`Generated ${duesToCreate.length} monthly dues for April-June`);

    console.log('Seeding successful');
    process.exit();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedResidents();
