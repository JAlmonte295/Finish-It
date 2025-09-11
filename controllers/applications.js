// controllers/applications.js

const express = require('express');
const router = express.Router();

const User = require('../models/user.js');

router.get('/', async (req, res) => {
    try {
        // Find the user from the database
        const user = await User.findById(req.session.user.id);
        // Render the index page, passing in the user's applications
        res.render('applications/index.ejs', {
            applications: user.applications,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

module.exports = router;
