const express = require('express');
const router = express.Router();
const { login, getStats, getContests } = require('../controllers/userController');

// Auth
router.post('/auth/login', login);

// Stats (topic breakdown, difficulty, heatmap, etc.)
router.get('/stats/:handle', getStats);

// Contests / rating history
router.get('/contests/:handle', getContests);

module.exports = router;
