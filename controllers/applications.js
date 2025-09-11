// controllers/applications.js

const express = require('express');
const router = express.Router();

const User = require('../models/user.js');

router.get('/', async (req, res) => {
    try {
        // Find the user from the database
        const currentUser = await User.findById(req.session.user.id);
        // Render the index page, passing in the user's applications
        res.render('applications/index.ejs', {
            applications: currentUser.applications,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/new', (req, res) => {
    res.render('applications/new.ejs');
});

router.post('/', async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user.id);
        currentUser.applications.push(req.body);
        await currentUser.save();
        res.redirect(`/users/${req.session.user.id}/applications`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});


module.exports = router;
