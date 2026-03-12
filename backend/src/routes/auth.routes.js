const router = require('express').Router();
const { register, login, getMe, updateProfile, changePassword, createSuperAdmin } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.post('/setup-superadmin', createSuperAdmin);
router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);
router.patch('/profile', authenticate, updateProfile);
router.patch('/change-password', authenticate, changePassword);

module.exports = router;
