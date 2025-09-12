// controllers/games.js

const express = require('express');
const router = express.Router({ mergeParams: true });

const User = require('../models/user.js');

router.get('/', async (req, res) => {
    try {
        // A user should only be able to see their own games list.
        // If the logged-in user's ID from the session doesn't match the
        // userId in the URL, redirect them to their own games list.
        if (req.session.user.id !== req.params.userId) {
            return res.redirect(`/users/${req.session.user.id}/games`);
        }
        // Find the user from the database
        const user = await User.findById(req.params.userId);
        if (!user) {
            // If the user is not found, it might be a bad session.
            // Redirect to the home page and destroy the session.
            req.session.destroy(() => {
                res.redirect('/');
            });
            return;
        }
        // Render the index page, passing in the user's games
        res.render('games/index.ejs', {
            games: user.games,
            pageOwner: user,
            title: `${user.username}'s Backlog`,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/new', (req, res) => {
    // The pageOwner is the currently signed-in user.
    res.render('games/new.ejs', {
        pageOwner: req.session.user,
        title: 'Add New Game',
    });
});

router.post('/', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);

        if (!currentUser) {
            // If the user is not found, it might be a bad session.
            // Redirect to the home page and destroy the session.
            req.session.destroy(() => {
                res.redirect('/');
            });
            return;
        }

        // Check if the user making the request is the owner of the page
        if (currentUser.id !== req.session.user.id) {
            return res.redirect(`/users/${req.session.user.id}/games`);
        }

        currentUser.games.push(req.body);
        await currentUser.save();
        res.redirect(`/users/${currentUser.id}/games`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/:gameId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            // If the user is not found, it might be a bad session.
            // Redirect to the home page and destroy the session.
            req.session.destroy(() => {
                res.redirect('/');
            });
            return;
        }
        const game = user.games.id(req.params.gameId);
        if (!game) {
            // If the game is not found, redirect to that user's game list
            return res.redirect(`/users/${user.id}/games`);
        }
        res.render('games/show.ejs', {
            game,
            pageOwner: user,
            title: game.title,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.delete('/:gameId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);

        if (!currentUser) {
            // If the user is not found, it might be a bad session.
            // Redirect to the home page and destroy the session.
            req.session.destroy(() => {
                res.redirect('/');
            });
            return;
        }

        // Check if the user making the request is the owner of the page
        if (currentUser.id !== req.session.user.id) {
            return res.redirect(`/users/${req.session.user.id}/games`);
        }

        // Use the .pull() method to remove the game from the subdocument array
        // .pull() finds and removes all matching documents.
        currentUser.games.pull({ _id: req.params.gameId });
        await currentUser.save();
        res.redirect(`/users/${currentUser.id}/games`);
        } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/:gameId/edit', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
            // If the user is not found, it might be a bad session.
            // Redirect to the home page and destroy the session.
            req.session.destroy(() => {
                res.redirect('/');
            });
            return;
        }

        // Check if the user making the request is the owner of the page
        if (user.id !== req.session.user.id) {
            return res.redirect(`/users/${req.session.user.id}/games`);
        }

        const game = user.games.id(req.params.gameId);
        if (!game) {
            // If the game is not found, redirect to that user's game list
            return res.redirect(`/users/${user.id}/games`);
        }
        res.render('games/edit.ejs', {
            game,
            pageOwner: user,
            title: `Edit ${game.title}`,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.put('/:gameId', async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);

        if (!currentUser) {
            // If the user is not found, it might be a bad session.
            // Redirect to the home page and destroy the session.
            req.session.destroy(() => {
                res.redirect('/');
            });
            return;
        }

        // Check if the user making the request is the owner of the page
        if (currentUser.id !== req.session.user.id) {
            return res.redirect(`/users/${req.session.user.id}/games`);
        }

        const game = currentUser.games.id(req.params.gameId);
        if (!game) {
            // If the game is not found, redirect to that user's game list
            return res.redirect(`/users/${currentUser.id}/games`);
        }
        game.set(req.body);
        await currentUser.save();
        res.redirect(`/users/${currentUser.id}/games/${req.params.gameId}`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

module.exports = router;
