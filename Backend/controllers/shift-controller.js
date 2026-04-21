
const db = require('../config/db-config');
const moment = require("moment-timezone");

const getCurrentShift = async (req, res) => {
  try {
    // Always use Sri Lanka timezone
    const nowSL = moment().tz("Asia/Colombo");

    const currentMinutes =
      nowSL.hour() * 60 + nowSL.minute();

    const serverTime = nowSL.format("HH:mm:ss");

    const [shifts] =await db.query(
      "SELECT shiftId, shiftCategory, startTime, endTime FROM shift_types"
    );

    let activeShift = null;

    for (let shift of shifts) {
      const [startHour, startMinute] = shift.startTime.split(":").map(Number);
      const [endHour, endMinute] = shift.endTime.split(":").map(Number);

      const startTotal = startHour * 60 + startMinute;
      const endTotal = endHour * 60 + endMinute;

      if (startTotal < endTotal) {
        // Normal shift
        if (currentMinutes >= startTotal && currentMinutes < endTotal) {
          activeShift = shift;
        }
      } else {
        // Cross midnight
        if (currentMinutes >= startTotal || currentMinutes < endTotal) {
          activeShift = shift;
        }
      }
    }

    if (!activeShift) {
      return res.status(404).json({ message: "No active shift found" });
    }

    res.json({
      ...activeShift,
      serverTime,
      timezone: "Asia/Colombo",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getWeeklyShiftStats = async (req, res) => {
    try {
        const employeeId = req.user.employeeId;

        const [rows] = await db.query(
            `SELECT st.shiftCategory, COUNT(*) AS total
             FROM attendance a
             JOIN shift_types st ON a.shiftId = st.shiftId
             WHERE a.employeeId = ?
             AND a.workStatus = 'CHECKED_OUT'
             AND YEARWEEK(a.attendanceDate, 1) = YEARWEEK(CURDATE(), 1)
             GROUP BY st.shiftCategory`,
            [employeeId]
        );

        let dayShifts = 0;
        let nightShifts = 0;

        rows.forEach(row => {
            if (row.shiftCategory === "DAY") {
                dayShifts = row.total;
            }
            if (row.shiftCategory === "NIGHT") {
                nightShifts = row.total;
            }
        });

        return res.json({
            dayShifts,
            nightShifts,
            totalShifts: dayShifts + nightShifts
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};

module.exports = {
    getCurrentShift,getWeeklyShiftStats
}