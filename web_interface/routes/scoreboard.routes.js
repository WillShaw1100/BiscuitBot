const express = require('express');
const router = express.Router();
const path = require("path");

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const refreshUserPermissions = require('../middleware/refreshUserPermissions');
const requirePermission = require('../middleware/requirePermission');

const scoreboardController = require('../controllers/scoreboard.controller');

router.use(ensureAuthenticated, refreshUserPermissions);

// Public scoreboard (view only)
router.get('/', requirePermission('canViewManage'),scoreboardController.getScoreboard);

// List seasons
router.get(
    '/seasons',
    requirePermission('canViewManage'),
    scoreboardController.listSeasons
);

// Reset season
router.post(
    '/resetSeason',
    requirePermission('canResetSeason'),
    scoreboardController.resetSeason
);

// Add game
router.post(
    '/addGameWithScores',
    requirePermission('canAddScores'),
    scoreboardController.addGame
);

// Update historical game
router.post(
    '/updateGame',
    requirePermission('canEditHistorical'),
    scoreboardController.updateGame
);

// Add user to scoreboard
router.post(
    '/add',
    requirePermission('canAddScores'),
    scoreboardController.addUser
);

// Search users
router.get(
    '/search',
    requirePermission('canAddScores'),
    scoreboardController.searchUsers
);

router.get(
    '/export',
    requirePermission('canViewManage'),
    scoreboardController.exportScoreboard
);



router.get("/manage-scoreboard", requirePermission('canViewManage'), (req, res) => {
    const fs = require("fs");
    const path = require("path");

    let html = fs.readFileSync(path.join(__dirname, "../views/manage-scoreboard.html"), "utf8");

    const selectedGuild = req.session.guildId;
    const filteredGuild = req.session.user.guilds.find(g => g.id === selectedGuild);

    html = html
        .replace('{{guilds}}', JSON.stringify([filteredGuild]))
        .replace('{{selectedGuild}}', selectedGuild);


    res.send(html);
});

module.exports = router;
