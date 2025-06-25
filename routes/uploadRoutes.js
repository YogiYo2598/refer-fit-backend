// routes/uploadRoutes.js
const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const s3 = require('../config/s3');
const path = require('path');
require('dotenv').config();

const router = express.Router();

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
      const filename = `resumes/${Date.now()}-${file.originalname}`;
      cb(null, filename);
    }
  }),
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    if (ext !== '.pdf') {
      return cb(new Error('Only PDFs are allowed'));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.post('/upload/resume', upload.single('resume'), (req, res) => {
  res.json({
    message: 'Resume uploaded successfully',
    url: req.file.location
  });
});

module.exports = router;
