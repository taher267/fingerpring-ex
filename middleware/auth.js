const User = require('../models/User');
const { verify } = require('jsonwebtoken');

module.exports = {
  authentication: async (req, res, next) => {
    try {
      if (req.headers?.authorization?.startsWith('Bearer ')) {
        const token = req.headers.authorization?.split(' ')[1];
        const decoded = verify(token, process.env.JWT_SECRET);
        if (!decoded)
          return res.status(401).send({
            isSuccess: false,
            isTokenExpired: true,
            message: 'Please send valid token at header!',
          });

        const { email, uid, _id } = decoded;
        const currentUser = await User.findOne({
          email,
          uid,
        })
          .select('_id status createdAt')
          .exec();
        // console.log(currentUser);
        if (!currentUser)
          return res.status(401).json({ message: `Invalid credientils` });
        if (currentUser?.status !== 'Active')
          return res.status(401).json({ message: `Inactive Account` });
        req.user = {
          email,
          uid,
          ...currentUser._doc,
        };
        return next();
      } else {
        return res.status(401).send({
          isSuccess: false,
          isTokenExpired: true,
          message: 'Please send valid token at header!',
        });
      }
    } catch (e) {
      console.log(e);
      return res.status(401).send({
        isSuccess: false,
        isTokenExpired: true,
        message: e.message || 'Token expired, please login again',
      });
    }
  },
  authorization: async (req, res, next) => {
    const SUPER_ADMIN = process.env.SUPER_ADMIN;
    try {
      const auth = req.user?.roles;
      // console.log(auth, 'roles');
      if (!auth?.length) return res.sendStatus(403);
      if (!auth?.includes(SUPER_ADMIN)) return res.sendStatus(403);
      return next();
    } catch (e) {
      return res.sendStatus(500);
    }
  },
};
