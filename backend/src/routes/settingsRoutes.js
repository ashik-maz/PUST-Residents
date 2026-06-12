const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, authorize('Provost', 'Co-Provost'), getSettings);
router.put('/', protect, authorize('Provost'), updateSettings);

module.exports = router;
