const cron = require('node-cron');
const User = require('../models/User');
const Due = require('../models/Due');
const Settings = require('../models/Settings');

const initCronJobs = () => {
  // Run at 00:00 on day-of-month 1
  cron.schedule('0 0 1 * *', async () => {
    console.log('Running monthly due generation...');
    try {
      const settings = await Settings.findOne();
      if (!settings) {
        console.error('Settings not found. Cannot generate dues.');
        return;
      }

      const activeResidents = await User.find({ role: 'Student', status: 'Active' });
      const now = new Date();
      const month = now.getMonth() + 1; // 1-12
      const year = now.getFullYear();

      for (const resident of activeResidents) {
        const hallFees = settings.monthlyFees[resident.hallName];
        if (hallFees) {
          const amount = (hallFees.seatRent || 0) + (hallFees.establishment || 0);
          
          if (amount > 0) {
            // Check if due already exists for this month/year to avoid duplicates
            const existingDue = await Due.findOne({
              student: resident._id,
              type: 'Monthly',
              month,
              year,
            });

            if (!existingDue) {
              await Due.create({
                student: resident._id,
                amount,
                type: 'Monthly',
                month,
                year,
                description: `Monthly Fee for ${now.toLocaleString('default', { month: 'long' })} ${year}`,
              });
              console.log(`Generated due for ${resident.studentId}`);
            }
          }
        }
      }
      console.log('Monthly due generation completed.');
    } catch (error) {
      console.error('Error in monthly due generation:', error);
    }
  });
};

module.exports = initCronJobs;
