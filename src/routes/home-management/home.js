const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/home.controller');

router.post('/', homeController.initializeHome);
router.get('/', homeController.getHome);
router.delete('/', homeController.deleteHome);

module.exports = router;