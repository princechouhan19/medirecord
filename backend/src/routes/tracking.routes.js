const router = require('express').Router();
const { getAll, create, addVisit, complete, getScheduleStats } = require('../controllers/tracking.controller');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);
router.get('/stats', getScheduleStats);
router.get('/', getAll);
router.post('/', create);
router.post('/:id/visit', addVisit);
router.patch('/:id/complete', complete);

module.exports = router;
