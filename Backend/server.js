const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const ngoRoutes = require('./routes/ngoRoutes');

const app = express();
connectDB();
app.use(express.json({ limit: '10mb' })); // or higher if needed
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cors());
app.use(express.json());
app.use(express.static('Frontend'));
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

// ...existing code...
app.use('/api/ngo', ngoRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
