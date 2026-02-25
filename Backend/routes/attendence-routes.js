const express = require('express');
const router = express.Router();

 const {CheckIn,getAttendanceStatus,CheckOut, getWeeklyHours} = require('../controllers/attendence-controller');
const authMiddleware = require('../middleware/auth-middleware');

router.post('/checkin',authMiddleware, CheckIn);
router.post('/checkout', authMiddleware, CheckOut);
router.get('/status', authMiddleware,getAttendanceStatus);
router.get('/weekly-hours', authMiddleware,getWeeklyHours);

module.exports= router;