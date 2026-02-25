
const db = require('../config/db-config');

const addDailyLog = async (req, res) => {
const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const employeeId = req.user.employeeId;
    const substationId = req.user.substation.substationId;
    const {
      date,
      time,
      total11kV,
      transformer01,
      transformer02,
      feeders,
      stationSupply,
      remarks,
    } = req.body;

    console.log("req body", req.body);

    //  Validate checked-in attendance
    const [attendanceRows] = await connection.query(
      `SELECT id, attendanceDate
       FROM attendance
       WHERE employeeId = ?
       AND workStatus = 'CHECKED_IN'
       AND attendanceDate = CURDATE()
       LIMIT 1`,
      [employeeId]
    );

    if (!attendanceRows.length) {
      throw new Error("You must be checked in to add logs.");
    }

    const attendanceId = attendanceRows[0].id;

    //  Insert main daily_logs row
    const [logResult] = await connection.query(
      `INSERT INTO daily_logs
       (attendanceId, employeeId, substationId,
        logDate, logTime, total11kV, remarks)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        attendanceId,
        employeeId,
        substationId,
        date,
        time,
        total11kV || null,
        remarks || null,
      ]
    );

    const dailyLogId = logResult.insertId;

    //  Insert transformer 01
    await connection.query(
      `INSERT INTO transformer_logs
       (dailyLogId, transformerNo, kv33, kv11, amps11, tapPosition, pf)
       VALUES (?, 1, ?, ?, ?, ?, ?)`,
      [
        dailyLogId,
        transformer01?.kv33 || null,
        transformer01?.kv11 || null,
        transformer01?.amps11 || null,
        transformer01?.tap || null,
        transformer01?.pf || null,
      ]
    );

    //  Insert transformer 02
    await connection.query(
      `INSERT INTO transformer_logs
       (dailyLogId, transformerNo, kv33, kv11, amps11, tapPosition, pf)
       VALUES (?, 2, ?, ?, ?, ?, ?)`,
      [
        dailyLogId,
        transformer02?.kv33 || null,
        transformer02?.kv11 || null,
        transformer02?.amps11 || null,
        transformer02?.tap || null,
        transformer02?.pf || null,
      ]
    );

    //  Insert feeder currents (1–7)
    for (let i = 1; i <= 7; i++) {
      await connection.query(
        `INSERT INTO feeder_logs
         (dailyLogId, feederNo, current)
         VALUES (?, ?, ?)`,
        [
          dailyLogId,
          i,
          feeders?.[`f${i}`] || null,
        ]
      );
    }

    //  Insert station supply
    await connection.query(
      `INSERT INTO station_supply_logs
       (dailyLogId, voltage, amps)
       VALUES (?, ?, ?)`,
      [
        dailyLogId,
        stationSupply?.voltage || null,
        stationSupply?.amps || null,
      ]
    );

    await connection.commit();

    res.json({
      message: "Daily log saved successfully",
      logId: dailyLogId,
    });

  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(400).json({ message: err.message });
  } finally {
    connection.release();
  }
};

module.exports={
    addDailyLog
}