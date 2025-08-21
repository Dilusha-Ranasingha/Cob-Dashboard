const express = require('express');
const { getCobs, addCob } = require('../controllers/cobController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', getCobs);
router.post('/', auth, addCob);

module.exports = router;