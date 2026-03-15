const router = require('express').Router();
const c = require('../controllers/referredDoctor.controller');
const { authenticate, requireRole } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', c.getAll);
router.post('/', c.create);
router.patch('/:id', c.update);
router.delete('/:id', c.remove);

module.exports = router;

router.get('/admin', requireRole('superadmin'), c.getAllAdmin);
