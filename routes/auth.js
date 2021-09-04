var express = require('express');
var router = express.Router();
const authenticateToken = require('../middlewares/authenticateToken');

const auth_controller = require('../controllers/authController');

router.get('/', authenticateToken, (req, res) => {
  res.sendStatus(200);
});

router.post('/sign-up', auth_controller.user_create);

router.post('/login', auth_controller.user_login);

router.get('/access-token', auth_controller.user_refresh_token);

module.exports = router;
