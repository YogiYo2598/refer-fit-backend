// routes/referralRoutes.js
const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const verifyToken = require('../middleware/authMiddleware');

// POST /referrals - create new referral request
router.post('/', referralController.createReferral);

// GET /referrals/my?userId=123
router.get('/my', referralController.getMyReferrals);

// GET /referrals/incoming?company=Google
router.get('/incoming', referralController.getIncomingReferrals);

// POST /referrals/:id/mark
router.post('/:id/mark', referralController.updateReferralStatus);

// DELETE /referrals/:id
router.delete('/:id', referralController.deleteReferral);


module.exports = router;