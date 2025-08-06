const express = require('express');
const router = express.Router();
const { getNearbyReports, acceptReport, markRescued, getOngoingRescues, getRescueSummary } = require('../controllers/ngoController');
const { getuserId } = require('../middleware/authMiddleware');

// Get nearby rescue requests (Pending)
router.get('/nearby-reports', getuserId, getNearbyReports);

// Accept a rescue request
router.post('/accept/:reportId', getuserId, acceptReport);

// Mark a rescue as completed
router.post('/rescue/:reportId', getuserId, markRescued);

// Get ongoing rescues (Accepted)
router.get('/ongoing-rescues', getuserId, getOngoingRescues);

// Get rescue summary/history
router.get('/summary', getuserId, getRescueSummary);

module.exports = router;