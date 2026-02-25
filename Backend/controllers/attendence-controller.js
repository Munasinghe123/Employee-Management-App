const db = require('../config/db-config');
const getDistance = require('../utils/Distance');
const moment = require('moment-timezone');

const CheckIn = async (req, res) => {
    try {
        const { latitude, longitude } = req.body;
        const employeeId = req.user.employeeId;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Location required" });
        }

        // Get substation details
        const [stationRows] = await db.query(
            `SELECT s.substationId, s.latitude, s.longitude
       FROM employee e
       JOIN substations s ON e.substationId = s.substationId
       WHERE e.employeeId = ?`,
            [employeeId]
        );

        if (stationRows.length === 0) {
            return res.status(404).json({ message: "Substation not found" });
        }

        const { substationId, latitude: stationLat, longitude: stationLon } =
            stationRows[0];

        //  Determine active shift (server-side)
        const nowSL = moment().tz("Asia/Colombo");
        const currentMinutes = nowSL.hour() * 60 + nowSL.minute();

        const [shiftTypes] = await db.query(
            "SELECT shiftId, startTime, endTime FROM shift_types"
        );

        let activeShift = null;

        for (let shift of shiftTypes) {
            const [sh, sm] = shift.startTime.split(":").map(Number);
            const [eh, em] = shift.endTime.split(":").map(Number);

            const start = sh * 60 + sm;
            const end = eh * 60 + em;

            if (start < end) {
                if (currentMinutes >= start && currentMinutes < end) {
                    activeShift = shift;
                }
            } else {
                if (currentMinutes >= start || currentMinutes < end) {
                    activeShift = shift;
                }
            }
        }

        if (!activeShift) {
            return res.status(400).json({ message: "No active shift right now" });
        }

        const shiftId = activeShift.shiftId;

        //  Prevent duplicate check-in
        const [existing] = await db.query(
            `SELECT id, workStatus
   FROM attendance
   WHERE employeeId = ?
   AND shiftId = ?
   AND attendanceDate = CURDATE()
   LIMIT 1`,
            [employeeId, shiftId]
        );

        if (existing.length > 0) {
            if (existing[0].workStatus === "CHECKED_IN") {
                return res.status(400).json({
                    message: "Already checked in for this shift",
                    attendance_status: "PRESENT"
                });
            }

            if (existing[0].workStatus === "CHECKED_OUT") {
                return res.status(400).json({
                    message: "Shift already completed",
                    attendance_status: "PENDING"
                });
            }
        }

        //  Distance validation
        const distance = getDistance(
            latitude,
            longitude,
            stationLat,
            stationLon
        );

        const ALLOWED_RADIUS = 50;
        const isValidLocation = distance <= ALLOWED_RADIUS;

        // 4 Insert attendance
        await db.query(
            `INSERT INTO attendance
       (employeeId, substationId, shiftId,
        attendanceDate, checkInTime,
        employeeLatitude, employeeLongitude,
        workStatus, isValidLocation)
       VALUES (?, ?, ?, CURDATE(), NOW(), ?, ?, ?, ?)`,
            [
                employeeId,
                substationId,
                shiftId,
                latitude,
                longitude,
                "CHECKED_IN",
                isValidLocation
            ]
        );

        return res.json({
            message: isValidLocation
                ? "Checked in successfully"
                : "Checked in (Location outside allowed radius)",
            distance,
            attendance_status: "PRESENT"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};


const CheckOut = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        // Find any open attendance session(no restriction)
        const [rows] = await db.query(
            `SELECT id, checkInTime
             FROM attendance
             WHERE employeeId = ?
             AND workStatus = 'CHECKED_IN'
             ORDER BY id DESC
             LIMIT 1`,
            [employeeId]
        );

        if (rows.length === 0) {
            return res.status(400).json({
                message: "No active check-in found",
                attendance_status: "PENDING"
            });
        }

        const attendanceId = rows[0].id;

        // Optional safety: prevent insane duration (e.g., 48 hours)
        const [durationRow] = await db.query(
            `SELECT TIMESTAMPDIFF(HOUR, checkInTime, NOW()) as hoursWorked
             FROM attendance
             WHERE id = ?`,
            [attendanceId]
        );

        if (durationRow[0].hoursWorked > 24) {
            return res.status(400).json({
                message: "Shift exceeded maximum allowed duration. Contact admin."
            });
        }

        // Update checkout time
        await db.query(
            `UPDATE attendance
             SET checkOutTime = NOW(),
                 workStatus = 'CHECKED_OUT'
             WHERE id = ?`,
            [attendanceId]
        );

        return res.json({
            message: "Checked out successfully",
            attendance_status: "PENDING"
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

const getAttendanceStatus = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        // Check if user has any open session
        const [attendance] = await db.query(
            `SELECT id
             FROM attendance
             WHERE employeeId = ?
             AND workStatus = 'CHECKED_IN'
             ORDER BY id DESC
             LIMIT 1`,
            [employeeId]
        );

        if (attendance.length > 0) {
            return res.json({ attendance_status: "PRESENT" });
        }

        return res.json({ attendance_status: "PENDING" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

// responsbile for calculating the OT hours
const getWeeklyHours = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const [rows] = await db.query(
            `SELECT 
                COALESCE(
                    SUM(TIMESTAMPDIFF(MINUTE, checkInTime, checkOutTime)),
                    0
                ) AS totalMinutes
             FROM attendance
             WHERE employeeId = ?
             AND workStatus = 'CHECKED_OUT'
             AND YEARWEEK(attendanceDate, 1) = YEARWEEK(CURDATE(), 1);`,
            [employeeId]
        );

        const WEEKLY_LIMIT_MINUTES = 45 * 60;

        const totalMinutesWeek = Number(rows[0].totalMinutes) || 0;

        let overtimeMinutesWeek = 0;

        if (totalMinutesWeek > WEEKLY_LIMIT_MINUTES) {
            overtimeMinutesWeek = totalMinutesWeek - WEEKLY_LIMIT_MINUTES;
        }

        const remainingMinutes =
            totalMinutesWeek < WEEKLY_LIMIT_MINUTES
                ? WEEKLY_LIMIT_MINUTES - totalMinutesWeek
                : 0;

        console.log("totalHours", (totalMinutesWeek / 60).toFixed(2));
        console.log("overtimeHours", (overtimeMinutesWeek / 60).toFixed(2));
        console.log("remainingHours", (remainingMinutes / 60).toFixed(2));

        return res.json({
            totalMinutes: totalMinutesWeek,
            overtimeMinutes: overtimeMinutesWeek,
            remainingMinutes: remainingMinutes,
            weeklyLimitMinutes: WEEKLY_LIMIT_MINUTES
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = { CheckIn, CheckOut, getAttendanceStatus, getWeeklyHours };