const express = require('express');
const router = express.Router();
const user = require('../models/user.js');

router.get('/', async (req, res) => {
    try {
        const users = await user.find({});
        res.render('users/index.ejs', {users});
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/:userId', async (req,res) => {
    try {
        res.redirect(`/users/${req.params.userId}/games`);
    } catch (error) {
        console.log(error);
        res.redirect('/users');
    }
});

module.exports = router;