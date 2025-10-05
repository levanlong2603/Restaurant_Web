const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const JWT_SECRET = process.env.JWT_SECRET;
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Không có token, truy cập bị từ chối!" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Token không hợp lệ!" });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;