// routes/companyRoutes.js
const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');

// Get All companies
router.get('/', companyController.getAllCompanies);

// get Companies in our network
router.get('/network', companyController.getNetworkCompanies);

module.exports = router;