const Scoreboard = require('../../models/scoreboard');
const { recalculatePoints } = require('../utils/points');

exports.getBoard = async (guildId, season = null) => {
    if (season !== null) {
        return Scoreboard.findOne({ guildId, season: Number(season) });
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
};

exports.listSeasons = guildId => {
    return Scoreboard.find({ guildId }).sort({ season: 1 });
};

exports.resetSeason = async guildId => {
    const latest = await Scoreboard.findOne({ guildId }).sort({ season: -1 });
    const nextSeason = latest ? latest.season + 1 : 1;

    return Scoreboard.create({
        guildId,
        season: nextSeason,
        players: []
    });
};

exports.addUserToBoard = async (board, member) => {
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

    return board.save();
};

exports.addGame = async (board, results) => {
    const scoreMap = new Map();
    results.forEach(r => scoreMap.set(r.userId, Number(r.score) || 0));

    const maxGames = Math.max(
        0,
        ...board.players.map(p => (p.games || []).length)
    );

    const newIndex = maxGames;

    board.players.forEach(p => {
        p.games = p.games || [];
        p.points = p.points || [];

        while (p.games.length < newIndex) p.games.push(null);
        while (p.points.length < newIndex) p.points.push(0);

        p.games.push(scoreMap.get(p.userId) ?? null);
    });

    recalculatePoints(board);
    return board.save();
};

exports.updateGameScore = async (board, userId, gameIndex, value) => {
    const player = board.players.find(p => p.userId === userId);
    if (!player) throw new Error("Player not found");

    player.games = player.games || [];

    while (player.games.length <= gameIndex) {
        player.games.push(null);
    }

    player.games[gameIndex] = value === "" || value == null ? null : Number(value);

    recalculatePoints(board);
    return board.save();
};
