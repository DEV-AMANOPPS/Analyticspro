const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { getUserInfo, getUserSubmissions, getUserRating } = require('../services/cfApi');
const { computeAnalytics } = require('../services/analyticsService');
const User = require('../models/User');

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { handle } = req.body;
    if (!handle) {
      return res.status(400).json({ error: 'Handle is required' });
    }

    const userInfo = await getUserInfo(handle.trim());
    const isDbConnected = mongoose.connection.readyState === 1;

    let user;
    if (isDbConnected) {
      user = await User.findOneAndUpdate(
        { handle: handle.toLowerCase() },
        {
          handle: handle.toLowerCase(),
          rank: userInfo.rank,
          rating: userInfo.rating,
          maxRating: userInfo.maxRating,
          maxRank: userInfo.maxRank,
          avatar: userInfo.avatar,
          titlePhoto: userInfo.titlePhoto,
          country: userInfo.country,
          organization: userInfo.organization,
          friendOfCount: userInfo.friendOfCount,
          registrationTimeSeconds: userInfo.registrationTimeSeconds,
          lastOnlineTimeSeconds: userInfo.lastOnlineTimeSeconds,
        },
        { upsert: true, new: true }
      );
    }

    const token = jwt.sign(
      { handle: handle.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { 
        handle: user?.handle || userInfo.handle || handle, 
        rank: user?.rank || userInfo.rank,
        rating: user?.rating || userInfo.rating,
        maxRating: user?.maxRating || userInfo.maxRating,
        maxRank: user?.maxRank || userInfo.maxRank,
        avatar: user?.avatar || userInfo.avatar,
        titlePhoto: user?.titlePhoto || userInfo.titlePhoto,
        country: user?.country || userInfo.country,
        organization: user?.organization || userInfo.organization,
        friendOfCount: user?.friendOfCount || userInfo.friendOfCount,
        registrationTimeSeconds: user?.registrationTimeSeconds || userInfo.registrationTimeSeconds,
        isDemo: !isDbConnected 
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(404).json({ error: err.message });
  }
};

// GET /api/stats/:handle
const getStats = async (req, res) => {
  try {
    const handle = req.params.handle.toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    let user;
    if (isDbConnected) {
      user = await User.findOne({ handle });
      
      // Upsert: Create user record if they bypassed login endpoint
      if (!user) {
        user = new User({ handle });
      }

      if (user.cachedStats) {
        // Return cached stats if fresh
        const lastFetched = user.cachedStats?.lastFetched;
        const isFresh = lastFetched && Date.now() - new Date(lastFetched).getTime() < CACHE_TTL_MS;

        if (isFresh && user.cachedStats.totalSolved !== undefined) {
          return res.json({ cached: true, stats: user.cachedStats });
        }
      }
    }

    // Fetch fresh from CF
    const submissions = await getUserSubmissions(handle);
    const analytics = computeAnalytics(submissions);

    if (isDbConnected && user) {
      user.cachedStats = { ...analytics, lastFetched: new Date() };
      await user.save();
    }

    res.json({ 
      cached: false, 
      stats: analytics, 
      isDemo: !isDbConnected 
    });
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch stats' });
  }
};

// GET /api/contests/:handle
const getContests = async (req, res) => {
  try {
    const handle = req.params.handle.toLowerCase();
    const isDbConnected = mongoose.connection.readyState === 1;

    let user;
    if (isDbConnected) {
       user = await User.findOne({ handle });
       if (!user) {
         user = new User({ handle });
       }
       if (user.cachedContests && user.cachedContests.length > 0 && user.updatedAt) {
         if (Date.now() - new Date(user.updatedAt).getTime() < CACHE_TTL_MS) {
            return res.json({ cached: true, ratingHistory: user.cachedContests });
         }
       }
    }

    const ratingHistory = await getUserRating(handle);
    
    if (isDbConnected && user) {
       user.cachedContests = ratingHistory;
       await user.save();
    }

    res.json({ cached: false, ratingHistory });
  } catch (err) {
    console.error('Contests error:', err.message);
    res.status(500).json({ error: err.message || 'Failed to fetch contest history' });
  }
};

module.exports = { login, getStats, getContests };
