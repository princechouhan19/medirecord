const router = require('express').Router();
const { getAll, getOne, create, update, remove, getStats } = require('../controllers/patient.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/stats', getStats);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
