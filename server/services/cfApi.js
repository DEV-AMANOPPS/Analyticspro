const axios = require('axios');

const CF_BASE = 'https://codeforces.com/api';

const cfGet = async (method, params = {}) => {
  const url = `${CF_BASE}/${method}`;
  const response = await axios.get(url, { params, timeout: 15000 });
  if (response.data.status !== 'OK') {
    throw new Error(response.data.comment || 'Codeforces API error');
  }
  return response.data.result;
};

const getUserInfo = async (handle) => {
  const result = await cfGet('user.info', { handles: handle });
  return result[0];
};

const getUserSubmissions = async (handle) => {
  return await cfGet('user.status', { handle, from: 1, count: 10000 });
};

const getUserRating = async (handle) => {
  return await cfGet('user.rating', { handle });
};

module.exports = { getUserInfo, getUserSubmissions, getUserRating };
