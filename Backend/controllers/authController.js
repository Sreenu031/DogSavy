const User = require('../models/User');
const Ngo = require('../models/Ngo');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register User
exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration error' });
  }
};

// Register NGO
exports.registerNgo = async (req, res) => {
  const { organizationName, email, password, phone, address, latitude, longitude } = req.body;
  try {
    const existing = await Ngo.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered as NGO' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const ngo = new Ngo({ organizationName, email, password: hashedPassword, phone, address, latitude, longitude });
    await ngo.save();

    res.status(201).json({ message: 'NGO registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration error' });
  }
};

// Login (for both User and NGO)
exports.login = async (req, res) => {
  const { email, password, role } = req.body;
  
  try {
    let account;

    if (role === 'user') {
      account = await User.findOne({ email });
    } else if (role === 'ngo') {
      account = await Ngo.findOne({ email });
    }

    if (!account) return res.status(404).json({ error: 'No account found' });

    const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid password' });

    const token = jwt.sign({ id: account._id, role }, 'secretkey', { expiresIn: '1h' });
    res.json({ message: 'Login successful', token, role });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
