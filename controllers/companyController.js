const { Op, fn, col } = require('sequelize');
const Company = require('../models/company');
const User = require('../models/user');

exports.getAllCompanies = async (req, res) => {
    try {
        // console.log("CALLED THIS API")
        const companies = await Company.findAll({
            attributes: [ 'name']
        });

        const options = companies.map(c => ({
            value: c.name,
            label: c.name
        }));
        // console.log(companies)
        res.json(options);
    } catch (err) {
        console.error('Error fetching Companies:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

exports.getNetworkCompanies = async (req, res) => {
    try {
        const companies = await User.findAll({
            attributes: [
                [fn('DISTINCT', col('company')), 'company']
            ],
            where: {
                company: { [Op.ne]: null }
            },
            raw: true
        });

        const options = companies.map(c => ({
            value: c.company,
            label: c.company
        }));

        res.json(options);
    } catch (err) {
        console.error('Failed to get companies:', err);
        res.status(500).json({ message: 'Server error' });
    }
}