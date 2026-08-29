const express = require('express');
const multer = require('multer');
const { analyzeResume } = require('../controllers/resumeController');

const router = express.Router();

// Setup Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed.'));
    }
  }
});

router.post('/analyze', upload.single('resume'), analyzeResume);

module.exports = router;
