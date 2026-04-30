require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const fruitRoutes = require('./routes/fruits');
const orderRoutes = require('./routes/orders');
const { getActiveSheetConfig } = require('./services/sheets');

const app = express();

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api/fruits', fruitRoutes);
app.use('/api/order', orderRoutes);
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/debug/sheet', (req, res) => res.json(getActiveSheetConfig()));

module.exports = app;
