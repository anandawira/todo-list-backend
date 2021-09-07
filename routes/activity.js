var express = require('express');
var router = express.Router();
const activityController = require('../controllers/activityController');
const authenticateToken = require('../middlewares/authenticateToken');

router.use(authenticateToken);

router
  .route('/')
  .get(activityController.activity_list)
  .post(activityController.activity_create);

router
  .route('/:id')
  .put(activityController.activity_edit)
  .delete(activityController.activity_delete);

module.exports = router;
