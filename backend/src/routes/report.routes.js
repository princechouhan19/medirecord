const router = require('express').Router();
const { getAll, getOne, create, remove, getCount } = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/count', getCount);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.delete('/:id', remove);

module.exports = router;
