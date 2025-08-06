const express = require('express');
const router = express.Router();
const { reportDog,getMyReports } = require('../controllers/userController');
const { getuserId } = require('../middleware/authMiddleware');

router.post('/report', getuserId,reportDog);
router.get('/my-reports',getuserId,  getMyReports);
module.exports = router;
