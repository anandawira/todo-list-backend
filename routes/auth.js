var express = require('express');
var router = express.Router();

const auth_controller = require('../controllers/authController');

router.post('/sign-up', auth_controller.user_create);

module.exports = router;
