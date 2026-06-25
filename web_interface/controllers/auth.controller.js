const asyncHandler = require('../middleware/asyncHandler');
const authService = require('../services/auth.service');
const discordService = require('../services/discord.service');
const permissionService = require('../services/permission.service');

exports.login = asyncHandler(async (req, res) => {
    const url = authService.getDiscordAuthUrl();
    res.redirect(url);
});

exports.callback = asyncHandler(async (req, res) => {
    const code = req.query.code;
    const accessToken = await authService.exchangeCodeForToken(code);

    const user = await authService.fetchDiscordUser(accessToken);
    const guilds = await authService.fetchDiscordGuilds(accessToken);

    req.session.user = user;
    req.session.accessToken = accessToken;
    req.session.user.guilds = guilds;

    // Default guild
    req.session.guildId = req.session.guildId || process.env.MAIN_GUILD_ID;

    // Load permissions
    req.session.permissions = await permissionService.getUserPermissions(
        req.session.guildId,
        user.id
    );

    res.redirect('/dashboard');
});
