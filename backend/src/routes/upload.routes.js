const router = require('express').Router();
const { uploadImage, deleteImage } = require('../controllers/upload.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

router.use(authenticate);
router.post('/', upload.single('file'), uploadImage);
router.delete('/', deleteImage);

module.exports = router;
