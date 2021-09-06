const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(' ')[1];

  if (accessToken === undefined) return res.sendStatus(401);
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: err.message });
    req.user = user;
    next();
  });
};
