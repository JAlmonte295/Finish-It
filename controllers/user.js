const express = require('express');
const router = express.Router();
const User = require('../models/user.js');

router.get('/', async (req, res) => {
    try {
        const users = await User.find({});
        res.render('users/index.ejs', {users});
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});
 
// This route will handle the user's profile page
router.get('/:userId/profile', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        res.render('users/profile.ejs', { user });
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;