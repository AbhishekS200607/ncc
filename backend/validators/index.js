const { body, param, validationResult } = require('express-validator');

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ success: false, errors: errors.array() });
  }
  next();
};

const registerValidator = [
  body('name').trim().notEmpty().isLength({ max: 100 }),
  body('whatsapp').trim().matches(/^[6-9]\d{9}$/),
  body('gender').isIn(['Male', 'Female', 'Other']),
  body('course').isIn([
    'Electrical and Electronic Engineering',
    'Automobile Engineering',
    'Civil Engineering',
    'Mechanical Engineering',
    'Electronics Engineering',
    'Computer Science Engineering'
  ]),
  body('ncc_certificate').isIn(['A Certificate', 'B Certificate', 'NIL']),
  body('guardian_name').trim().notEmpty().isLength({ max: 100 }),
  body('guardian_phone').trim().matches(/^[6-9]\d{9}$/),
  body('height').isFloat({ min: 100, max: 250 }),
  body('weight').isFloat({ min: 30, max: 200 }),
  body('percentage_10').isFloat({ min: 0, max: 100 }),
  body('percentage_12').isFloat({ min: 0, max: 100 }),
  body('school_activity').isIn(['SPC', 'Scouts & Guides', 'Red Cross', 'Other', 'NIL']),
  body('parent_service').isIn(['Currently Serving', 'Ex-Service', 'No']),
  handleValidation
];

const loginValidator = [
  body('username').trim().notEmpty().escape(),
  body('password').notEmpty().isLength({ min: 6 }),
  handleValidation
];

const idParamValidator = [
  param('id').isUUID(),
  handleValidation
];

module.exports = { registerValidator, loginValidator, idParamValidator };
