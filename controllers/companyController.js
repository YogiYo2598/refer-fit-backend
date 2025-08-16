const Company = require('../models/company');

exports.getAllCompanies = async (req, res) => {
    try {
        const companies = Company.findAll({
            attributes: ['id', 'name']
        });
        // console.log(companies)
        res.json(companies)
    } catch (err) {
        console.error('Error fetching Companies:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getNetworkCompanies = async (req, res) => {
    try {
        res.json({message: 'Successful'})
    } catch (err) {
        res.status(500).json({message : 'Internal server error'})
    }
}