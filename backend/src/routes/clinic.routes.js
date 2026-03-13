const router = require('express').Router();
const c = require('../controllers/clinic.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticate);

// Superadmin routes
router.get('/stats', requireRole('superadmin'), c.getStats);
router.get('/', requireRole('superadmin'), c.getAll);
router.post('/', requireRole('superadmin'), c.create);
router.get('/:id', requireRole('superadmin'), c.getOne);
router.patch('/:id', requireRole('superadmin'), c.update);
router.patch('/:id/toggle', requireRole('superadmin'), c.toggleActive);

// Clinic owner routes
router.get('/my/clinic', requireRole('clinic_owner'), c.getMyClinic);
router.patch('/my/clinic', requireRole('clinic_owner'), c.updateMyClinic);
router.get('/my/staff', requireRole('clinic_owner', 'superadmin'), c.getMyStaff);
router.post('/my/staff', requireRole('clinic_owner'), c.addStaff);
router.patch('/my/staff/:userId/toggle', requireRole('clinic_owner'), c.removeStaff);

module.exports = router;
