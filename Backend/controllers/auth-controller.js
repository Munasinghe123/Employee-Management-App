
const bcrypt = require('bcrypt');
const db = require('../config/db-config');
const jwt = require('jsonwebtoken')

const login = async (req, res) => {
  try {

    console.log("login endpoint hit");
    const { employeeId, password } = req.body;

    if (!employeeId || !password) {
      return res.status(400).json({ message: 'Missing credentials' });
    }

    const [rows] =await db.query(
      `
        SELECT 
          e.employeeId,
          e.name,
          e.password,
          e.role,
          e.userName,
          e.substationId,
          s.name AS substationName,
          s.latitude,
          s.longitude
        FROM employee e
        JOIN substations s 
          ON e.substationId = s.substationId
        WHERE e.employeeId = ?
      `,
      [employeeId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'No such user' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const accessToken = jwt.sign(
      {
        employeeId: user.employeeId,
        name: user.name,
        userName: user.userName,
        role: user.role,
        substation: {
          substationId: user.substationId,
          name: user.substationName,
          latitude: user.latitude,
          longitude: user.longitude
        }
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Login successful');

    res.status(200).json({ accessToken });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const register = async (req, res) => {
  try {
    const { name, password, employeeId, role, userName, substationId } = req.body;

    if (!name || !password || !employeeId || !role || !userName || !substationId) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const [existingUser] = await db.query('SELECT employeeId FROM employee WHERE employeeId=?', [employeeId]);

    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

        await db.query(
        'INSERT INTO employee (name,password,employeeId,role,userName,substationId) VALUES (?,?,?,?,?,?)',
        [name, hashedPassword, employeeId, role, userName, substationId]
      );

    res.status(201).json({ message: "User registered successfully" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login }