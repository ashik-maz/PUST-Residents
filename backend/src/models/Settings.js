const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  admissionFees: {
    seatRent: { type: Number, default: 0 },
    establishmentFee: { type: Number, default: 0 },
    hallSecurityDeposit: { type: Number, default: 0 },
    hallDevelopmentFee: { type: Number, default: 0 },
    utensilsFee: { type: Number, default: 0 },
    miscellaneousFee: { type: Number, default: 0 },
    idCardFee: { type: Number, default: 0 },
    hallLibraryFee: { type: Number, default: 0 },
    otherCharges: { type: Number, default: 0 },
  },
  monthlyFees: {
    'July-6 Hall': {
      seatRent: { type: Number, default: 200 },
      establishment: { type: Number, default: 150 },
    },
    'Gonotontro Hall': {
      seatRent: { type: Number, default: 200 },
      establishment: { type: Number, default: 150 },
    },
    'Shadhinota Hall': {
      seatRent: { type: Number, default: 150 },
      establishment: { type: Number, default: 100 },
    },
    'Matrivasha Hall': {
      seatRent: { type: Number, default: 150 },
      establishment: { type: Number, default: 100 },
    },
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Settings', settingsSchema);
