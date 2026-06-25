const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');
const fs = require('fs');

exports.renderDashboard = asyncHandler(async (req, res) => {
    const file = path.join(__dirname, '../views/dashboard.html');
    let html = fs.readFileSync(file, 'utf8');

    const avatarUrl = req.session.user.avatar
        ? `https://cdn.discordapp.com/avatars/${req.session.user.id}/${req.session.user.avatar}.png?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    html = html
        .replace(/{{username}}/g, req.session.user.username)
        .replace(/{{id}}/g, req.session.user.id)
        .replace(/{{avatar}}/g, avatarUrl)
        .replace('{{guilds}}', JSON.stringify(req.session.user.guilds))
        .replace('{{selectedGuild}}', req.session.guildId)
        .replace(/{{canViewManage}}/g, String(req.session.permissions.canViewManage))
        .replace(/{{canAddScores}}/g, String(req.session.permissions.canAddScores))
        .replace(/{{canResetSeason}}/g, String(req.session.permissions.canResetSeason))
        .replace(/{{canEditHistorical}}/g, String(req.session.permissions.canEditHistorical))
        .replace(/{{canManagePermissions}}/g, String(req.session.permissions.canManagePermissions));

    res.send(html);
});
