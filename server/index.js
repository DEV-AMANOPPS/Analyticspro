require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const apiRoutes = require('./routes/api');

const app = express();

// Middleware
app.use(helmet());

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'CF Tracker API running ✅' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

const PORT = process.env.PORT || 5000;

// Start server with DB connection
const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      console.log('⏳ Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGO_URI);
      console.log('✅ MongoDB connected successfully');
    } else {
      console.warn("⚠️ Running without MongoDB (No MONGO_URI)");
    }
  } catch (err) {
    console.warn("\n⚠️  WARNING: MongoDB connection failed:", err.message);
    console.warn("⚠️  The app will run in \"Live Mode\" without local caching.\n");
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api`);
  });
};

startServer();