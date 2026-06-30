const asyncHandler = require('../middleware/asyncHandler');
const path = require('path');
const fs = require('fs');
const { getMutualGuilds } = require('../services/discord.service');

exports.renderDashboard = asyncHandler(async (req, res) => {
    const file = path.join(__dirname, '../views/dashboard.html');
    let html = fs.readFileSync(file, 'utf8');

    const avatarUrl = req.session.user.avatar
        ? `https://cdn.discordapp.com/avatars/${req.session.user.id}/${req.session.user.avatar}.png?size=128`
        : 'https://cdn.discordapp.com/embed/avatars/0.png';

    const mutualGuilds = getMutualGuilds(req.session.user.guilds);

    const selectedGuild =
        mutualGuilds.find(g => g.id === req.session.guildId)?.id ||
        mutualGuilds[0]?.id ||
        "";
        
    html = html
        .replace(/{{username}}/g, req.session.user.username)
        .replace(/{{id}}/g, req.session.user.id)
        .replace(/{{avatar}}/g, avatarUrl)
        .replace('{{guilds}}', JSON.stringify(mutualGuilds))
        .replace('{{selectedGuild}}', selectedGuild)
        .replace(/{{canViewManage}}/g, String(req.session.permissions.canViewManage))
        .replace(/{{canAddScores}}/g, String(req.session.permissions.canAddScores))
        .replace(/{{canResetSeason}}/g, String(req.session.permissions.canResetSeason))
        .replace(/{{canEditHistorical}}/g, String(req.session.permissions.canEditHistorical))
        .replace(/{{canManagePermissions}}/g, String(req.session.permissions.canManagePermissions))
        .replace(/{{canViewBans}}/g, String(req.session.permissions.canViewBans))
        .replace(/{{canViewAuditLog}}/g, String(req.session.permissions.canViewAuditLog));

    res.send(html);
});
