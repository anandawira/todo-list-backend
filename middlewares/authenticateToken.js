const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (accessToken === undefined) return res.sendStatus(401);
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (!err.expiredAt) {
        return res.status(403).json({ message: err.message });
      }

      if (req.get('refresh_token') === undefined) {
        return res.status(400).json({
          message:
            'Access token expired. refresh_token not specified, CANNOT auto refresh new token.',
        });
      }

      jwt.verify(
        req.get('refresh_token'),
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          if (err) return res.status(403).json({ message: err.message });
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d',
          });

          res.append('new_access_token', accessToken);
          req.user = user;
          return next();
        },
      );
    } else {
      req.user = user;
      return next();
    }
  });
};
