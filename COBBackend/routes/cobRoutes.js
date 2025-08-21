const express = require('express');
const { getCobs, addCob } = require('../controllers/cobController');

const router = express.Router();

router.get('/', getCobs);
router.post('/', addCob);

module.exports = router;