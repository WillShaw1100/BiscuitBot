const express = require('express');
const router = express.Router();
const ExcelJS = require('exceljs');
const Scoreboard = require('../../models/Scoreboard');
const client = require('../../core/client');

// ===============================
// SAFE GET / CREATE BOARD (BY SEASON)
// ===============================
async function getBoard(seasonParam) {
    const guildId = process.env.MAIN_GUILD_ID;

    if (seasonParam) {
        let board = await Scoreboard.findOne({ guildId, season: Number(seasonParam) });
        if (!board) {
            board = await Scoreboard.create({
                guildId,
                season: Number(seasonParam),
                players: []
            });
        }
        return board;
    }

    let board = await Scoreboard.findOne({ guildId }).sort({ season: -1 });

    if (!board) {
        board = await Scoreboard.create({
            guildId,
            season: 1,
            players: []
        });
    }

    return board;
}

// ===============================
// POINTS SYSTEM (DERIVED)
// ===============================
function recalculatePoints(board) {
    const maxGames = Math.max(
        0,
        ...board.players.map(p => (p.games || []).length)
    );

    board.players.forEach(p => {
        p.points = Array(maxGames).fill(0);
    });

    for (let gameIndex = 0; gameIndex < maxGames; gameIndex++) {

        const results = board.players
            .map(p => ({
                userId: p.userId,
                score: p.games?.[gameIndex]
            }))
            .filter(x => x.score !== null && x.score !== undefined)
            .sort((a, b) => b.score - a.score);

        if (results.length === 0) continue;

        let rank = 0;
        let lastScore = null;

        for (let i = 0; i < results.length; i++) {
            const r = results[i];

            if (r.score !== lastScore) {
                rank = i + 1;
                lastScore = r.score;
            }

            let points = 0;
            if (rank === 1) points = 3;
            else if (rank === 2) points = 2;
            else if (rank === 3) points = 1;

            const player = board.players.find(p => p.userId === r.userId);
            if (player) {
                player.points[gameIndex] = points;
            }
        }
    }
}

// ===============================
// GET SCOREBOARD (OPTIONAL ?season=)
// ===============================
router.get('/', async (req, res) => {
    try {
        const seasonParam = req.query.season;
        const board = await getBoard(seasonParam);
        res.json(board);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

// ===============================
// LIST SEASONS
// ===============================
router.get('/seasons', async (req, res) => {
    try {
        const guildId = process.env.MAIN_GUILD_ID;
        const boards = await Scoreboard.find({ guildId }).sort({ season: 1 });
        res.json(boards.map(b => b.season));
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to list seasons');
    }
});

// ===============================
// RESET SEASON (CREATE NEW SEASON)
// ===============================
router.post('/resetSeason', async (req, res) => {
    try {
        const guildId = process.env.MAIN_GUILD_ID;

        const latest = await Scoreboard.findOne({ guildId }).sort({ season: -1 });
        const nextSeason = latest ? latest.season + 1 : 1;

        const newBoard = await Scoreboard.create({
            guildId,
            season: nextSeason,
            players: []
        });

        res.json({ success: true, season: newBoard.season });
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to reset season');
    }
});

// ===============================
// ADD GAME
// ===============================
router.post('/addGameWithScores', async (req, res) => {
    try {
        const { results } = req.body;

        const board = await getBoard();

        const scoreMap = new Map();
        (results || []).forEach(r => {
            scoreMap.set(r.userId, Number(r.score) || 0);
        });

        const maxGames = Math.max(
            0,
            ...board.players.map(p => (p.games || []).length)
        );

        const newIndex = maxGames;

        board.players.forEach(p => {
            p.games = p.games || [];
            p.points = p.points || [];

            while (p.games.length < newIndex) {
                p.games.push(null);
            }

            while (p.points.length < newIndex) {
                p.points.push(0);
            }

            p.games.push(
                scoreMap.has(p.userId)
                    ? scoreMap.get(p.userId)
                    : null
            );
        });

        recalculatePoints(board);

        await board.save();
        res.json(board);

    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to add game');
    }
});

// ===============================
// UPDATE GAME
// ===============================
router.post('/updateGame', async (req, res) => {
    try {
        const { userId, gameIndex, value } = req.body;

        const board = await getBoard();

        const player = board.players.find(p => p.userId === userId);
        if (!player) return res.status(404).send('Player not found');

        player.games = player.games || [];

        while (player.games.length <= gameIndex) {
            player.games.push(null);
        }

        player.games[gameIndex] =
            value === "" || value == null ? null : Number(value);

        recalculatePoints(board);

        await board.save();

        res.json({ success: true });

    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to update game');
    }
});

// ===============================
// ADD USER
// ===============================
router.post('/add', async (req, res) => {
    try {
        const { userId } = req.body;

        const guild = await client.guilds.fetch(process.env.MAIN_GUILD_ID);
        const member = await guild.members.fetch(userId);

        const board = await getBoard();

        if (board.players.some(p => p.userId === userId)) {
            return res.status(409).send('Player already exists');
        }

        const maxGames = Math.max(
            0,
            ...board.players.map(p => (p.games || []).length)
        );

        const newPlayer = {
            userId: member.user.id,
            username: member.user.username,
            avatar: member.user.displayAvatarURL(),
            games: Array(maxGames).fill(null),
            points: Array(maxGames).fill(0)
        };

        board.players.push(newPlayer);

        recalculatePoints(board);
        await board.save();

        res.json(board);

    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to add user');
    }
});

// ===============================
// SEARCH
// ===============================
router.get('/search', async (req, res) => {
    try {
        if (!req.session.canEdit)
            return res.status(403).send('Forbidden');

        const query = (req.query.q || '').toLowerCase();

        const guild = await client.guilds.fetch(process.env.MAIN_GUILD_ID);

        const results = guild.members.cache
            .filter(m => {
                const username = m.user.username.toLowerCase();
                const display = (m.displayName || '').toLowerCase();

                return username.includes(query) || display.includes(query);
            })
            .first(10)
            .map(m => ({
                id: m.user.id,
                username: m.user.username,
                displayName: m.displayName,
                avatar: m.user.displayAvatarURL()
            }));

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).send('Search failed');
    }
});

// ===============================
// EXPORT (CURRENT SEASON)
// ===============================
router.get('/export', async (req, res) => {
    try {
        const board = await getBoard();

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet(`Leaderboard S${board.season}`);

        const maxGames = Math.max(
            0,
            ...board.players.map(p => (p.games || []).length)
        );

        sheet.addRow([
            'Username',
            'Traitor Wins',
            'Total Points',
            ...Array.from({ length: maxGames }, (_, i) => `Game ${i + 1}`)
        ]);

        board.players.forEach(p => {
            const totalPoints = (p.points || []).reduce((a, b) => a + (b || 0), 0);

            sheet.addRow([
                p.username,
                (p.games || []).filter(g => g !== null && g !== undefined).length,
                totalPoints,
                ...(p.games || []).map(g => g ?? 'N/A')
            ]);
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="scoreboard-season-${board.season}-${Date.now()}.xlsx"`
        );

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error(err);
        res.status(500).send('Export failed');
    }
});

module.exports = router;