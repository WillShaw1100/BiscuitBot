const express = require('express');
const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const requirePermission = require('../middleware/requirePermission');
const refreshUserPermissions = require('../middleware/refreshUserPermissions');

const permissionsController = require('../controllers/permissions.controller');

router.use(ensureAuthenticated, refreshUserPermissions);

router.get("/manage-permissions", (req, res) => {
    const fs = require("fs");
    const path = require("path");

    let html = fs.readFileSync(path.join(__dirname, "../views/manage-permissions.html"), "utf8");

    const selectedGuild = req.session.guildId;
    const filteredGuild = req.session.user.guilds.find(g => g.id === selectedGuild);

    html = html
        .replace('{{guilds}}', JSON.stringify([filteredGuild]))
        .replace('{{selectedGuild}}', selectedGuild)
        .replace('{{owners}}', JSON.stringify(require("../../config").owners));

    res.send(html);
});


router.get(
    '/search',
    requirePermission('canManagePermissions'),
    permissionsController.searchUsers
);

router.get(
    '/list',
    requirePermission('canManagePermissions'),
    permissionsController.listPermissionedUsers
);


router.get(
    '/:userId',
    requirePermission('canManagePermissions'),
    permissionsController.getUserPermissions
);

router.post(
    '/:userId',
    requirePermission('canManagePermissions'),
    permissionsController.updateUserPermissions
);

module.exports = router;
