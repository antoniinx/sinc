const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const contactsRoutes = require('./routes/contacts');
const groupsRoutes = require('./routes/groups');
const eventsRoutes = require('./routes/events');
const commentsRoutes = require('./routes/comments');
const usersRoutes = require('./routes/users');
const friendsRoutes = require('./routes/friends');
const aiRoutes = require('./routes/ai');
const invitationRoutes = require('./routes/invitations');
const notificationRoutes = require('./routes/notifications');
const path = require('path');

const app = express();

// Initialize database in production
if (process.env.NODE_ENV === 'production') {
  const { initFunction } = require('./config/database');
  initFunction().then(() => {
    console.log('Database initialized for production');
  }).catch(err => {
    console.error('Failed to initialize database:', err);
  });
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sinc.vercel.app', 'https://sinc-git-main-antoniinx.vercel.app'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends', friendsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
