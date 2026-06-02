const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { parseMarkdown } = require('../utils/markdownParser');

const router = express.Router();

const upload = multer({
  dest: path.join(__dirname, '../uploads/'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter(req, file, cb) {
    if (path.extname(file.originalname).toLowerCase() !== '.md') {
      return cb(new Error('Only .md files are allowed.'));
    }
    cb(null, true);
  },
});

// POST /api/slides/parse — parse raw markdown text
router.post('/parse', (req, res) => {
  const { markdown } = req.body;
  if (!markdown || typeof markdown !== 'string') {
    return res.status(400).json({ error: 'markdown field is required and must be a string.' });
  }

  try {
    const slides = parseMarkdown(markdown);
    res.json({ slides, count: slides.length });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// POST /api/slides/upload — upload a .md file and parse it
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const filePath = req.file.path;

  try {
    const markdown = fs.readFileSync(filePath, 'utf-8');
    const slides = parseMarkdown(markdown);
    res.json({ slides, count: slides.length, filename: req.file.originalname });
  } catch (err) {
    res.status(422).json({ error: err.message });
  } finally {
    fs.unlink(filePath, () => {}); // clean up temp file
  }
});

// Multer error handler
router.use((err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File too large. Maximum size is 10 MB.' });
  }
  if (err.message) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});

module.exports = router;
