const router = require('express').Router();
const c = require('../controllers/patient.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticate);

// All clinic roles
router.get('/today',      c.getTodayQueue);        // live daily queue
router.get('/stats',      c.getStats);
router.get('/pndt',       c.getPndtRegister);       // 12-col PNDT register
router.get('/activity',   c.getActivityLog);        // audit log for owner
router.get('/',           c.getAll);
router.get('/:id',        c.getOne);

// Receptionist: register new patient
router.post('/', requireRole('receptionist', 'clinic_owner', 'superadmin'), c.create);

// Lab handler + owner: update status
router.patch('/:id/status', requireRole('lab_handler', 'receptionist', 'clinic_owner', 'superadmin'), c.updateStatus);
router.patch('/:id',        requireRole('receptionist', 'clinic_owner', 'superadmin'), c.update);
router.delete('/:id',       requireRole('clinic_owner', 'superadmin'), c.remove);

module.exports = router;
