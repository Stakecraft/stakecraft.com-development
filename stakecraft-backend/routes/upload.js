import express from 'express'
import multer from 'multer'
import { authenticateToken, requireEditor } from '../middleware/auth.js'

const router = express.Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'))
    }
  }
})

router.post('/ipfs', authenticateToken, requireEditor, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' })
    }

    const apiKey = process.env.PINATA_API_KEY
    const secretKey = process.env.PINATA_SECRET_KEY

    if (!apiKey || !secretKey) {
      return res.status(503).json({ error: 'IPFS upload not configured' })
    }

    const formData = new FormData()
    formData.append(
      'file',
      new Blob([req.file.buffer], { type: req.file.mimetype }),
      req.file.originalname
    )

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey
      },
      body: formData
    })

    if (!response.ok) {
      const text = await response.text()
      console.error('Pinata upload failed:', text)
      return res.status(502).json({ error: 'IPFS upload failed' })
    }

    const result = await response.json()
    res.json({ hash: result.IpfsHash, IpfsHash: result.IpfsHash })
  } catch (error) {
    console.error('IPFS upload error:', error)
    res.status(500).json({ error: 'IPFS upload failed' })
  }
})

export default router
