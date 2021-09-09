var express = require('express');
var router = express.Router();
const usersController = require('../controllers/usersController');
const authenticateToken = require('../middlewares/authenticateToken');

router.get('/', authenticateToken, usersController.list_all_user);

module.exports = router;
