const express = require('express');
const { getCobs, addCob, updateCob, deleteCob } = require('../controllers/cobController');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', getCobs);
router.post('/', auth, addCob);
router.put('/:id', auth, updateCob);
router.delete('/:id', auth, deleteCob);

module.exports = router;