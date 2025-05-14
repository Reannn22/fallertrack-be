const express = require('express');
const router = express.Router();
const navigationController = require('../../controllers/navigation.controller');

router.post('/', navigationController.computeRoute);

module.exports = router;
