// utils/auth.js
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'replace_me';
const COOKIE_NAME = 'uw_admin_token';

function signAdmin() {
  return jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '12h' });
}

function verifyTokenFromReq(req) {
  const c = req.headers.cookie || '';
  const pk = c.split(';').map(s => s.trim()).find(s => s.startsWith(COOKIE_NAME + '='));
  if (!pk) return null;
  const token = pk.split('=')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

module.exports = { signAdmin, verifyTokenFromReq, COOKIE_NAME };
