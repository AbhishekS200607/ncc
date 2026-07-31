const router = require('express').Router();
const { login } = require('../controllers/adminController');
const { getAll, getOne, update, updateStatus, remove, statistics, exportData } = require('../controllers/applicationController');
const auth = require('../middleware/auth');
const { loginValidator, idParamValidator } = require('../validators');

router.post('/login', loginValidator, login);

// Protected routes
router.use(auth);
router.get('/applications', getAll);
router.get('/applications/export', exportData);
router.get('/application/:id', idParamValidator, getOne);
router.put('/application/:id', idParamValidator, update);
router.patch('/application/:id/status', idParamValidator, updateStatus);
router.delete('/application/:id', idParamValidator, remove);
router.get('/statistics', statistics);

module.exports = router;
