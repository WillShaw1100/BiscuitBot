const express = require('express');
const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const refreshUserPermissions = require('../middleware/refreshUserPermissions');
const bansController = require('../controllers/bans.controller');
const requirePermission = require('../middleware/requirePermission');

router.use(ensureAuthenticated, refreshUserPermissions);

router.get('/list', requirePermission('canViewBans'), bansController.getBans);

router.get('/manage-bans', requirePermission('canViewBans'), (req, res) => {
    const fs = require("fs");
    const path = require("path");

    let html = fs.readFileSync(path.join(__dirname, "../views/manage-bans.html"), "utf8");

    html = html
        .replace('{{guilds}}', JSON.stringify(req.session.user.guilds))
        .replace('{{selectedGuild}}', req.session.guildId);

    res.send(html);
});

module.exports = router;
