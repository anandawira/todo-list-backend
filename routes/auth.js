var express = require('express');
var router = express.Router();
const rateLimit = require('express-rate-limit');

const auth_controller = require('../controllers/authController');

router.post('/sign-up', auth_controller.user_create);

router.post('/login', auth_controller.user_login);

router.get('/access-token', auth_controller.user_refresh_token);

const forgotLimit = rateLimit({ windowMs: 1 * 60 * 60 * 1000, max: 5 });
router.post(
  '/forget-password',
  forgotLimit,
  auth_controller.send_reset_password_email,
);

module.exports = router;
