const express = require('express');
const router = express.Router();
const {getCurrentShift,getWeeklyShiftStats} = require('../controllers/shift-controller');
const authMiddleware = require('../middleware/auth-middleware');

router.get('/current', authMiddleware, getCurrentShift);
router.get('/weekly-shifts', authMiddleware, getWeeklyShiftStats);

module.exports = router;