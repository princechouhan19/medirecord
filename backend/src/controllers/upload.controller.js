const { getImagekit } = require('../config/imagekit')

exports.uploadImage = async (req, res, next) => {
  try {
    const ik = getImagekit()
    if (!ik) return res.status(503).json({ error: 'ImageKit not configured' })
    if (!req.file) return res.status(400).json({ error: 'No file provided' })
    const result = await ik.upload({
      file: req.file.buffer.toString('base64'),
      fileName: `${Date.now()}_${req.file.originalname}`,
      folder: req.body.folder || '/medirecord',
    })
    res.json({ url: result.url, fileId: result.fileId, name: result.name })
  } catch (err) { next(err) }
}

exports.deleteImage = async (req, res, next) => {
  try {
    const ik = getImagekit()
    if (!ik) return res.status(503).json({ error: 'ImageKit not configured' })
    const { fileId } = req.body
    if (!fileId) return res.status(400).json({ error: 'fileId required' })
    await ik.deleteFile(fileId)
    res.json({ message: 'File deleted' })
  } catch (err) { next(err) }
}
