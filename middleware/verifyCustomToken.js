const jwt = require('jsonwebtoken');

// writing utils function instead of middleware
const getEmailFromToken = (token) => {};
const createError = require('http-errors');
const User = require('../models/User');

const verifyCustomTokenMiddleware = async (req, res, next) => {
  if (req.headers?.authorization?.startsWith('Bearer ')) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { tokenData, exp } = decoded;
      const { email, UID } = tokenData;
      const currentUser = await User.findOne({ UID }).select('_id');
      if (!currentUser)
        return res.status(401).json({ message: `Invalid credientils` });
      req.user = {
        email,
        UID,
        _id: currentUser.id || currentUser?._id,
      };
      return next();
    } catch (e) {
      return res.status(401).send({
        isSuccess: false,
        isTokenExpired: true,
        message: e.message || 'Token expired, please login again',
      });
    }
  } else {
    return res.status(401).send({
      isSuccess: false,
      isTokenExpired: true,
      message: 'Please send valid token at header!',
    });
  }
};

module.exports = { verifyCustomTokenMiddleware };
