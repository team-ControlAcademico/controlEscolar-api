const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authenticate = require('../middleware/auth');
const validate = require('../validators');
const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
} = require('../validators/authValidator');

router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.me);
router.put('/me', authenticate, authController.updateProfile);
router.post('/forgot-password', forgotPasswordRules, validate, authController.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, authController.resetPassword);

module.exports = router;
