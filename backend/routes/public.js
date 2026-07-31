const router = require('express').Router();
const { register, checkStatus } = require('../controllers/applicationController');
const { registerValidator } = require('../validators');

router.post('/register', registerValidator, register);
router.get('/status/:appId', checkStatus);

module.exports = router;
