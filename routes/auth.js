var express = require('express');
var router = express.Router();
const rateLimit = require('express-rate-limit');

const auth_controller = require('../controllers/authController');

router.get('/', (req, res) => res.redirect('/api-docs'));

router.post('/sign-up', auth_controller.user_create);

router.post('/login', auth_controller.user_login);

const forgotLimit = rateLimit({ windowMs: 1 * 60 * 60 * 1000, max: 5 });
router.post(
  '/forget-password',
  forgotLimit,
  auth_controller.send_reset_password_email,
);

// TODO: redirect GET/reset '/reset-password/:resetToken' to front-end url

router.post('/reset-password/:resetToken', auth_controller.reset_password);

module.exports = router;
