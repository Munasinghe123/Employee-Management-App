
const{addDailyLog} = require('../controllers/daily-logsheet-controller')
const authMiddleware = require('../middleware/auth-middleware')
const express = require('express');
const router = express.Router();


router.post('/add', authMiddleware,addDailyLog);

module.exports = router