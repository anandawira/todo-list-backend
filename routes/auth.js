var express = require('express');
var router = express.Router();

const auth_controller = require('../controllers/authController');

router.post('/sign-up', auth_controller.user_create);

router.get('/login', auth_controller.user_login);

router.get('/access-token', auth_controller.user_refresh_token);

module.exports = router;
