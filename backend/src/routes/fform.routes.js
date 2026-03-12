const router = require('express').Router();
const { getAll, getOne, getByPatient, create, update, remove } = require('../controllers/fform.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/', getAll);
router.get('/:id', getOne);
router.get('/patient/:patientId', getByPatient);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
