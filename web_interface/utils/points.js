exports.recalculatePoints = board => {
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
            .filter(x => x.score != null)
            .sort((a, b) => b.score - a.score);

        let rank = 0;
        let lastScore = null;

        results.forEach((r, i) => {
            if (r.score !== lastScore) {
                rank = i + 1;
                lastScore = r.score;
            }

            const points = rank === 1 ? 3 : rank === 2 ? 2 : rank === 3 ? 1 : 0;

            const player = board.players.find(p => p.userId === r.userId);
            if (player) player.points[gameIndex] = points;
        });
    }
};
