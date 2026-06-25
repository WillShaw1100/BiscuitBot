const asyncHandler = require('../middleware/asyncHandler');
const scoreboardService = require('../services/scoreboard.service');
const discordService = require('../services/discord.service');
const { logAction } = require('../utils/auditLogger');

exports.getScoreboard = asyncHandler(async (req, res) => {
    const board = await scoreboardService.getBoard(
        req.session.guildId,
        req.query.season || null
    );

    if (!board) {
        return res.status(404).json({ error: "Season not found" });
    }

    res.json(board);
});

exports.listSeasons = asyncHandler(async (req, res) => {
    const seasons = await scoreboardService.listSeasons(req.session.guildId);
    res.json(seasons.map(s => s.season));
});

exports.resetSeason = asyncHandler(async (req, res) => {
    const newBoard = await scoreboardService.resetSeason(req.session.guildId);

    await logAction('reset_season', {
        actorId: req.session.user.id,
        actorName: req.session.user.username,
        season: newBoard.season
    });

    res.json({ success: true, season: newBoard.season });
});

exports.addGame = asyncHandler(async (req, res) => {
    const board = await scoreboardService.getBoard(req.session.guildId);
    const updated = await scoreboardService.addGame(board, req.body.results);

    await logAction('add_game', {
        actorId: req.session.user.id,
        actorName: req.session.user.username,
        season: updated.season,
        results: req.body.results
    });

    res.json(updated);
});

exports.updateGame = asyncHandler(async (req, res) => {
    const { userId, gameIndex, value } = req.body;

    const board = await scoreboardService.getBoard(req.session.guildId);
    await scoreboardService.updateGameScore(board, userId, gameIndex, value);

    await logAction('update_game', {
        actorId: req.session.user.id,
        actorName: req.session.user.username,
        userId,
        gameIndex,
        newValue: value
    });

    res.json({ success: true });
});

exports.addUser = asyncHandler(async (req, res) => {
    const guildId = req.session.guildId;
    const member = await discordService.getGuildMember(guildId, req.body.userId);

    const board = await scoreboardService.getBoard(guildId);
    const updated = await scoreboardService.addUserToBoard(board, member);

    await logAction('add_user', {
        actorId: req.session.user.id,
        actorName: req.session.user.username,
        userId: member.user.id,
        username: member.user.username
    });

    res.json(updated);
});

exports.searchUsers = asyncHandler(async (req, res) => {
    const guildId = req.session.guildId;
    const query = (req.query.q || "").toLowerCase();

    if (!query) return res.json([]);

    // Get guild from client cache
    const guild = req.app.get("discordClient").guilds.cache.get(guildId);

    if (!guild) {
        return res.status(500).json({ error: "Guild not found in cache" });
    }

    // Use cached members ONLY — no API calls
    const results = guild.members.cache
        .filter(m => m.user.username.toLowerCase().includes(query))
        .map(m => ({
            id: m.user.id,
            username: m.user.username,
            avatar: m.user.displayAvatarURL()
        }))
        .slice(0, 20); // limit results

    res.json(results);
});

exports.exportScoreboard = asyncHandler(async (req, res) => {
    const guildId = req.session.guildId;

    const board = await scoreboardService.getBoard(guildId);

    if (!board) {
        return res.status(404).json({ error: "No scoreboard found" });
    }

    // Convert to CSV
    let csv = "Username,Total Score,Total Points\n";

    for (const p of board.players) {
        const totalScore = (p.games || []).reduce((a, b) => a + (b || 0), 0);
        const totalPoints = (p.points || []).reduce((a, b) => a + (b || 0), 0);

        csv += `"${p.username}",${totalScore},${totalPoints}\n`;
    }

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=scoreboard.csv");
    res.send(csv);
});

