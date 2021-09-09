const User = require('../models/user');

exports.list_all_user = (req, res, next) => {
  // Check if user have admin access
  if (!req.user.isAdmin) {
    return res
      .status(403)
      .json({ message: "This user doesn't have admin role" });
  }

  // Get users list
  User.find(
    { isAdmin: false },
    { first_name: 1, last_name: 1, email: 1, _id: 0 },
    (err, users) => {
      // Check errors
      if (err) {
        return next(err);
      }

      // send response
      return res.status(200).json(users);
    },
  );
  // send response
};
