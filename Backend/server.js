require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('./config/db-config')

const authRoutes = require('../Backend/routes/auth-routes');
const shitfRoutes = require('../Backend/routes/shitf-routes');
const attendenceRoutes = require('../Backend/routes/attendence-routes');
const dailyLogRoutes = require('../Backend/routes/daily-logsheet-routes')

const port = process.env.PORT;
const app = express();
app.use(express.json());
app.use(cors());

//db connection check
(async () => {
    try {
        const connection = await db.getConnection();
        console.log(' Connected to MySQL database ');
        connection.release();
    } catch (err) {
        console.error('MySQL connection failed:', err.message);
        process.exit(1);
    }
})();

//routes
app.use('/auth', authRoutes);
app.use('/shift', shitfRoutes);
app.use('/attendance', attendenceRoutes);
app.use('/dailyLog',dailyLogRoutes)


app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
});



