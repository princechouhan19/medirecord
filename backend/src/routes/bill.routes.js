const router = require('express').Router();
const c = require('../controllers/bill.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/stats', c.getStats);
router.get('/', c.getAll);
router.get('/:id', c.getOne);
router.post('/', requireRole('receptionist','clinic_owner','superadmin'), c.create);
router.patch('/:id', requireRole('receptionist','clinic_owner','superadmin'), c.update);
router.delete('/:id', requireRole('clinic_owner','superadmin'), c.remove);

module.exports = router;
