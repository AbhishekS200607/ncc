const adminService = require('../services/adminService');
const logger = require('../utils/logger');

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await adminService.loginAdmin(username, password);
    logger.info(`Admin login: ${username}`);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

module.exports = { login };
