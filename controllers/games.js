// controllers/games.js

const express = require('express');
const router = express.Router({ mergeParams: true });

const User = require('../models/user.js');
const axios = require('axios');

// Middleware to check if a user is signed in.
function isSignedIn(req, res, next) {
  if (!req.session.user) {
    return res.redirect('/auth/sign-in');
  }
  next();
}

// Middleware to check if the logged-in user is the owner of the backlog.
// This will protect the create, update, and delete routes.
async function checkOwnership(req, res, next) {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            // If user not found, maybe a bad session.
            return req.session.destroy(() => res.redirect('/'));
        }
        // Check if the user making the request is the owner of the page
        if (!req.session.user || user.id !== req.session.user.id) {
            return res.redirect(`/users/${req.session.user.id}/games`);
        }
        // Attach the user document to the request for the next route handler to use.
        req.pageOwner = user;
        next();
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
}

// =============================================
//                ROUTES
// =============================================

router.get('/', async (req, res) => {
    try {
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

        // Group games by their status for better organization in the view.
        const gamesByStatus = {
            'In Progress': [],
            'Pending': [],
            'Completed': [],
            'Dropped': [],
        };

        user.games.forEach(game => {
            // Default status to 'Pending' for any older data that might not have it.
            const status = game.status || 'Pending';
            if (gamesByStatus[status]) {
                gamesByStatus[status].push(game);
            }
        });

        // Render the index page, passing in the user's games
        res.render('games/index.ejs', {
            gamesByStatus,
            pageOwner: user,
            title: `${user.username}'s Backlog`,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/new', isSignedIn, (req, res) => {
    // The pageOwner is the currently signed-in user.
    res.render('games/new.ejs', {
        pageOwner: req.session.user,
        title: 'Add New Game',
    });
});

router.post('/', isSignedIn, checkOwnership, async (req, res) => {
    try {
        // Validate that a title was provided.
        if (!req.body.title || !req.body.title.trim()) {
            return res.render('games/new.ejs', {
                pageOwner: req.session.user,
                title: 'Add New Game',
                error: 'Title is a required field.',
                game: req.body, // Pass back the submitted data to pre-fill the form
            });
        }

        // If the rating is an empty string, it means "No Rating" was selected.
        // We should remove it from the request body so Mongoose doesn't try to save it.
        if (req.body.rating === '') {
            delete req.body.rating;
        }

        // If a boxArt URL is provided, use it. Otherwise, fetch from RAWG.
        if (!req.body.boxArt) {
            try {
                const response = await axios.get(`https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(req.body.title)}`);
                if (response.data.results.length > 0) {
                    // Use the background image from the first result
                    req.body.boxArt = response.data.results[0].background_image;
                }
            } catch (apiError) {
                // If the API call fails, we can just proceed without box art.
                console.log('RAWG API call failed:', apiError.message);
            }
        }

        req.pageOwner.games.push(req.body);
        await req.pageOwner.save();
        res.redirect(`/users/${req.pageOwner.id}/games`);
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

router.delete('/:gameId', isSignedIn, checkOwnership, async (req, res) => {
    try {
        // Use the .pull() method to remove the game from the subdocument array
        // .pull() finds and removes all matching documents.
        req.pageOwner.games.pull({ _id: req.params.gameId });
        await req.pageOwner.save();
        res.redirect(`/users/${req.pageOwner.id}/games`);
        } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.get('/:gameId/edit', isSignedIn, checkOwnership, async (req, res) => {
    try {
        const game = req.pageOwner.games.id(req.params.gameId);
        if (!game) {
            // If the game is not found, redirect to that user's game list
            return res.redirect(`/users/${req.pageOwner.id}/games`);
        }
        res.render('games/edit.ejs', {
            game,
            pageOwner: req.pageOwner,
            title: `Edit ${game.title}`,
        });
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

router.put('/:gameId', isSignedIn, checkOwnership, async (req, res) => {
    try {
        const game = req.pageOwner.games.id(req.params.gameId);
        if (!game) {
            // If the game is not found, redirect to that user's game list
            return res.redirect(`/users/${req.pageOwner.id}/games`);
        }

        // If the rating is an empty string, it means "No Rating" was selected.
        // We need to explicitly unset it in the document.
        if (req.body.rating === '') {
            req.body.rating = undefined;
        }

        game.set(req.body);
        await req.pageOwner.save();
        res.redirect(`/users/${req.pageOwner.id}/games/${req.params.gameId}`);
    } catch (error) {
        console.log(error);
        res.redirect('/');
    }
});

module.exports = router;
