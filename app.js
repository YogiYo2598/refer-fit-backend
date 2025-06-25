// // app.js
// const express = require('express');
// const cors = require('cors');
// const dotenv = require('dotenv');
// const sequelize = require('./config/db');

// const referralRoutes = require('./routes/referralRoutes');
// const uploadRoutes = require('./routes/uploadRoutes');
// const userRoutes = require('./routes/userRoutes');
// const authRoutes = require('./routes/authRoutes');

// dotenv.config();
// const app = express();

// app.use(cors());
// app.use(express.json());

// // Routes
// app.use('/api/referrals', referralRoutes);
// app.use('/api', uploadRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);

// // Health check
// app.get('/', (req, res) => {
//   res.send('Referral Fit Backend API is running');
// });

// // Sync DB and start server
// const PORT = process.env.PORT || 5000;
// sequelize.sync().then(() => {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//   });
// }).catch(err => {
//   console.error('Unable to connect to the database:', err);
// });


// app.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const sequelize = require('./config/db');

const referralRoutes = require('./routes/referralRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

dotenv.config();
const app = express();

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/referrals', referralRoutes);
app.use('/api', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Referral Fit Backend API is running');
});

// Sync DB and start server
const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
