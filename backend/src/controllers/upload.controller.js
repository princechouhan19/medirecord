const imagekit = require('../config/imagekit');

exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file provided' });

    const result = await imagekit.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `${Date.now()}_${req.file.originalname}`,
      folder: req.body.folder || '/meditracker',
    });

    res.json({ url: result.url, fileId: result.fileId, name: result.name });
  } catch (err) { next(err); }
};

exports.deleteImage = async (req, res, next) => {
  try {
    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ error: 'fileId required' });
    await imagekit.deleteFile(fileId);
    res.json({ message: 'File deleted successfully' });
  } catch (err) { next(err); }
};
