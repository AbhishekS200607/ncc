const router = require('express').Router();
const { register } = require('../controllers/applicationController');
const { registerValidator } = require('../validators');

router.post('/register', registerValidator, register);

module.exports = router;
