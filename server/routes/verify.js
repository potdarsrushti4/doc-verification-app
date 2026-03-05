const express = require('express');
const multer = require('multer');
const router = express.Router();
const path = require('path');

// Setup Multer for file uploads
const storage = multer.memoryStorage(); // storing file in memory
const upload = multer({ storage: storage });

router.post('/', upload.single('document'), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Placeholder: Send to Python model, or perform logic here
    // Simulated response:
    const prediction = {
      status: 'real', // or 'fake'
      confidence: 0.92
    };

    res.status(200).json(prediction);
  } catch (err) {
    console.error('Verification failed:', err.message);
    res.status(500).json({ error: 'Verification error' });
  }
});

module.exports = router;
