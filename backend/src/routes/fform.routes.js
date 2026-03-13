const router = require('express').Router();
const { getAll, getOne, getByPatient, create, update, remove } = require('../controllers/fform.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

router.use(authenticate);
router.use(checkSubscription(['pro']));
router.get('/', getAll);
router.get('/:id', getOne);
router.get('/patient/:patientId', getByPatient);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
