// controllers/referralController.js
const ReferralRequest = require('../models/referralRequest');

exports.createReferral = async (req, res) => {
  try {
    const { userId, company, jobId, resumeUrl } = req.body;

    if (!userId || !company || !jobId || !resumeUrl) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const referral = await ReferralRequest.create({
      userId,
      company,
      jobId,
      resumeUrl
    });

    res.status(201).json({ message: 'Referral request created', referral });
  } catch (err) {
    console.error('Error creating referral request:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getMyReferrals = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: 'Missing userId' });

    const referrals = await ReferralRequest.findAll({ where: { userId } });
    res.json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch referrals' });
  }
};

exports.getIncomingReferrals = async (req, res) => {
  try {
    const { company } = req.query;
    if (!company) return res.status(400).json({ message: 'Missing company name' });

    const referrals = await ReferralRequest.findAll({ where: { company } });
    res.json(referrals);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch incoming requests' });
  }
};

exports.updateReferralStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['referred', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const referral = await ReferralRequest.findByPk(id);
    if (!referral) return res.status(404).json({ message: 'Referral not found' });

    referral.status = status;
    await referral.save();

    res.json({ message: 'Referral status updated', referral });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update referral' });
  }
};