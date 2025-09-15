const express = require('express');
const router = express.Router({ mergeParams: true });

const User = require('../models/user.js');
const axios = require('axios');

function isSignedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/sign-in');
  }
  next();
}

async function checkOwnership(req, res, next) {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return req.session.destroy(() => res.redirect('/'));
        }
        if (!req.session.user || user.id !== req.session.user.id) {
            return res.redirect(`/users/${req.session.user.id}/games`);
        }
        req.pageOwner = user;
        next();
    } catch (error) {
        res.redirect('/');
    }
}

async function findPageOwner(req, res, next) {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.redirect('/');
        }
        req.pageOwner = user;
        next();
    } catch (error) {
        res.redirect('/');
    }
}

router.get('/', findPageOwner, async (req, res) => {
    try {
        const gamesByStatus = {
            'In Progress': [],
            'Pending': [],
            'Completed': [],
            'Dropped': [],
        };

        req.pageOwner.games.forEach(game => {
            const status = game.status || 'Pending';
            if (gamesByStatus[status]) {
                gamesByStatus[status].push(game);
            }
        });

        res.render('games/index.ejs', {
            gamesByStatus,
            pageOwner: req.pageOwner,
            title: `${req.pageOwner.username}'s Backlog`,
        });
    } catch (error) {
        res.redirect('/');
    }
});

router.get('/new', isSignedIn, (req, res) => {
    res.render('games/new.ejs', {
        pageOwner: req.session.user,
        title: 'Add New Game',
    });
});

router.post('/', isSignedIn, checkOwnership, async (req, res) => {
    try {
        if (!req.body.title || !req.body.title.trim()) {
            return res.render('games/new.ejs', {
                pageOwner: req.session.user,
                title: 'Add New Game',
                error: 'Title is a required field.',
                game: req.body,
            });
        }

        if (!req.body.dateAdded) {
            req.body.dateAdded = new Date();
        }

        if (req.body.rating === '') {
            delete req.body.rating;
        }

        if (!req.body.boxArt) {
            try {
                const response = await axios.get(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(req.body.title)}`);
                if (response.data.results.length > 0) {
                    req.body.boxArt = response.data.results[0].background_image;
                }
            } catch (apiError) {
            }
        }

        req.pageOwner.games.push(req.body);
        await req.pageOwner.save();
        res.redirect(`/users/${req.pageOwner.id}/games`);
    } catch (error) {
        res.redirect('/');
    }
});

router.get('/:gameId', findPageOwner, async (req, res) => {
    try {
        const game = req.pageOwner.games.id(req.params.gameId);
        if (!game) {
            return res.redirect(`/users/${req.pageOwner.id}/games`);
        }
        res.render('games/show.ejs', {
            game,
            pageOwner: req.pageOwner,
            title: game.title,
        });
    } catch (error) {
        res.redirect('/');
    }
});

router.delete('/:gameId', isSignedIn, checkOwnership, async (req, res) => {
    try {
        req.pageOwner.games.pull({ _id: req.params.gameId });
        await req.pageOwner.save();
        res.redirect(`/users/${req.pageOwner.id}/games`);
        } catch (error) {
        res.redirect('/');
    }
});

router.get('/:gameId/edit', isSignedIn, checkOwnership, async (req, res) => {
    try {
        const game = req.pageOwner.games.id(req.params.gameId);
        if (!game) {
            return res.redirect(`/users/${req.pageOwner.id}/games`);
        }
        res.render('games/edit.ejs', {
            game,
            pageOwner: req.pageOwner,
            title: `Edit ${game.title}`,
        });
    } catch (error) {
        res.redirect('/');
    }
});

router.put('/:gameId', isSignedIn, checkOwnership, async (req, res) => {
    try {
        const game = req.pageOwner.games.id(req.params.gameId);
        if (!game) {
            return res.redirect(`/users/${req.pageOwner.id}/games`);
        }

        if (req.body.rating === '') {
            req.body.rating = undefined;
        }

        game.set(req.body);
        await req.pageOwner.save();
        res.redirect(`/users/${req.pageOwner.id}/games/${req.params.gameId}`);
    } catch (error) {
        res.redirect('/');
    }
});

module.exports = router;
