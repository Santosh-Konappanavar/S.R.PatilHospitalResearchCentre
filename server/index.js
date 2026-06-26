const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

// Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });

// Routes
app.use('/api/auth',         require('./routes/auth'));
app.use('/api/users',        require('./routes/users'));
app.use('/api/departments',  require('./routes/departments'));
app.use('/api/updates',      require('./routes/updates'));
app.use('/api/patients',     require('./routes/patients'));
app.use('/api/opd',          require('./routes/opd'));
app.use('/api/ipd',          require('./routes/ipd'));
app.use('/api/staff',        require('./routes/staff'));
app.use('/api/purchase',     require('./routes/purchase'));
app.use('/api/licenses',     require('./routes/licenses'));
app.use('/api/dashboard',    require('./routes/dashboard'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', hospital: 'SRP Hospital Badgandi' }));
app.use((err, req, res, next) => res.status(500).json({ message: err.message }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🏥 Server running on http://localhost:${PORT}`));