const { getImagekit } = require('../config/imagekit')

// Sanitize name for use in filenames
const sanitize = str => (str || '')
  .trim()
  .replace(/[^a-zA-Z0-9\s_-]/g, '')   // remove special chars
  .replace(/\s+/g, '_')               // spaces to underscores
  .slice(0, 40)                        // max 40 chars

exports.uploadImage = async (req, res, next) => {
  try {
    const ik = getImagekit()
    if (!ik) return res.status(503).json({ error: 'ImageKit not configured' })
    if (!req.file) return res.status(400).json({ error: 'No file provided' })

    // Build descriptive filename
    // Accepts: req.body.patientName, req.body.label, req.body.folder
    const patientName = sanitize(req.body.patientName || '')
    const label       = sanitize(req.body.label || '')
    const ext         = (req.file.originalname.split('.').pop() || 'jpg').toLowerCase()
    const ts          = Date.now()

    let fileName
    if (patientName && label) {
      fileName = `${patientName}_${label}_${ts}.${ext}`
    } else if (patientName) {
      fileName = `${patientName}_${ts}.${ext}`
    } else if (label) {
      fileName = `${label}_${ts}.${ext}`
    } else {
      fileName = `${ts}_${req.file.originalname}`
    }

    const result = await ik.upload({
      file:     req.file.buffer.toString('base64'),
      fileName,
      folder:   req.body.folder || '/medirecord',
      // ImageKit custom metadata tags (for searching/filtering)
      tags:     [patientName, label, 'medirecord'].filter(Boolean),
    })

    res.json({
      url:      result.url,
      fileId:   result.fileId,
      name:     result.name,
      fileName,
    })
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
