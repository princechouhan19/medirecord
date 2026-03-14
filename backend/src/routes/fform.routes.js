const router = require('express').Router();
const { getAll, getOne, getByPatient, create, update, remove } = require('../controllers/fform.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

// Specific routes BEFORE parameterized routes
router.get('/patient/:patientId', getByPatient);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', create);
router.patch('/:id', update);
router.delete('/:id', remove);

module.exports = router;
