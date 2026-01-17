// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Health check (important for Render)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/contests', require('./routes/contests'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/admin', require('./routes/admin'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Add to backend/server.js
// Self-ping every 14 minutes to prevent spin-down during active matches
const SELF_PING_INTERVAL = 14 * 60 * 1000; // 14 minutes

if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    fetch(`https://fantasy-cricket-api.onrender.com/health`)
      .then(() => console.log('Self-ping successful'))
      .catch(err => console.error('Self-ping failed:', err));
  }, SELF_PING_INTERVAL);
}
