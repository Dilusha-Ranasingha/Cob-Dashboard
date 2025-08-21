const express = require('express');
const { login, seedAdmin } = require('../controllers/authController');

const router = express.Router();

router.post('/login', login);
router.post('/seed-admin', seedAdmin);

module.exports = router;
