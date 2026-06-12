const express = require('express');
const router = express.Router();
const { addResident, getResidents, getResidentById, updateResident } = require('../controllers/residentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .post(protect, authorize('Provost', 'Co-Provost'), addResident)
  .get(protect, authorize('Provost', 'Co-Provost'), getResidents);

router.route('/:id')
  .get(protect, getResidentById)
  .put(protect, authorize('Provost', 'Co-Provost'), updateResident);

module.exports = router;
