const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const reportRoutes = require('./routes/report.routes');
const trackingRoutes = require('./routes/tracking.routes');
const fformRoutes = require('./routes/fform.routes');
const uploadRoutes = require('./routes/upload.routes');
const clinicRoutes = require('./routes/clinic.routes');
const billRoutes   = require('./routes/bill.routes');

const errorHandler = require('./middlewares/error.middleware');
const path = require('path');

const app = express();

app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for static React files by default since they often have inline scripts
  crossOriginEmbedderPolicy: false
}));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use('/api', limiter);
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/fform', fformRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/bills',  billRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../public')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use(errorHandler);

module.exports = app;
