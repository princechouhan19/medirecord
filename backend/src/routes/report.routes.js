const router = require('express').Router();
const { getAll, getOne, create, remove, getCount } = require('../controllers/report.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

router.use(authenticate);
router.use(checkSubscription(['pro']));
router.get('/count', getCount);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.delete('/:id', remove);

module.exports = router;
