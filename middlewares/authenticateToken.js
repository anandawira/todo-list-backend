const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  // Extract access token from header
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(' ')[1];

  // If access token not found return 401
  if (accessToken === undefined) return res.sendStatus(401);

  // Verify access token
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    // Check if error
    if (err) {
      // Check if error is not because of expired token then return 401
      if (!err.expiredAt) {
        return res.status(401).json({ message: err.message });
      }

      // Check if user sent refresh token. if not then return 403
      if (req.get('refresh_token') === undefined) {
        return res.status(403).json({
          message:
            'Access token expired. refresh_token not specified, CANNOT auto refresh new token.',
        });
      }

      // Check if the refresh token is valid
      jwt.verify(
        req.get('refresh_token'),
        process.env.REFRESH_TOKEN_SECRET,
        (err, user) => {
          // If error return 403
          if (err)
            return res
              .status(403)
              .json({ message: 'refreshing access token failed' });
          const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: '1d',
          });

          // Add new token to the header
          res.append('new_access_token', accessToken);
          req.user = user;

          // go to next middleware
          return next();
        },
      );
    } else {
      // Add user from the token to the request object
      req.user = user;

      // go to next middleware
      return next();
    }
  });
};
