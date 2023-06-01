const { isValidObjectId } = require('mongoose');
const User = require('../models/User');

module.exports = {
  getAllUsersExports: async (req, res) => {
    const allUsersExports = await User.find().select('-token -tokenSecret');
    res.json({ allUsersExports });
  },

  getsingleUserExports: async (req, res) => {
    const { id } = req.params;
    if (!id)
      return res
        .status(400)
        .json({ success: false, message: `User id must be provide` });

    if (id && !isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: `Please provide a valid user id!` });

    const singleUserExports = await User.findById(id).select(
      '-token -tokenSecret'
    );

    res.json({ singleUserExports });
  },

  updateUser: async (req, res) => {
    const { id } = req.params;
    const { roles, status } = req.body;

    if (!id)
      return res
        .status(400)
        .json({ success: false, message: `User id must be provide` });

    if (id && !isValidObjectId(id))
      return res
        .status(400)
        .json({ success: false, message: `Please provide a valid user id!` });
    try {
      const updateData = {};
      if (roles?.length) updateData.roles = roles;
      if (status) updateData.roles = status === 'ACTIVE' ? true : false;
      const updateUser = await User.findByIdAndUpdate(id, updateData, {
        new: true,
      }).select('-token -tokenSecret');

      return res.json({ updateUser });
    } catch (e) {
      res.sendStatus(500);
    }
  },
};

// updateTokenOfUser : async (req, res) => {
//   try {
//     const { token, tokenSecret, screenName, UID, photoUrl } = req.body;

//     res.status(498).json({
//       message: `Nothing`,
//     });
//   } catch (e) {}
// };
