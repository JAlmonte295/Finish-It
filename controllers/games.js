// controllers/games.js

const express = require('express');
const router = express.Router();

const User = require('../models/user.js');

router.get('/', async (req, res) => {
    try {
        // Find the user from the database
        const currentUser = await User.findById(req.session.user.id);
        // Render the index page, passing in the user's games
        res.render('games/index.ejs', {
            games: currentUser.games,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/new', (req, res) => {
    res.render('games/new.ejs');
});

router.post('/', async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user.id);
        currentUser.games.push(req.body);
        await currentUser.save();
        res.redirect(`/users/${req.session.user.id}/games`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/:gameId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user.id);
        const game = currentUser.games.id(req.params.gameId);
        res.render('games/show.ejs', { game });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.delete('/:gameId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user.id);
        // Use the .pull() method to remove the game from the subdocument array
        // .pull() finds and removes all matching documents.
        currentUser.games.pull({ _id: req.params.gameId });
        await currentUser.save();
        res.redirect(`/users/${req.session.user.id}/games`);
        } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/:gameId/edit', async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user.id);
        const game = currentUser.games.id(req.params.gameId);
        res.render('games/edit.ejs', { game });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.put('/:gameId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.session.user.id);
        const game = currentUser.games.id(req.params.gameId);
        game.set(req.body);
        await currentUser.save();
        res.redirect(`/users/${req.session.user.id}/games`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

module.exports = router;
