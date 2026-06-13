const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    MessageFlags,
} = require("discord.js");

const Scoreboard = require("../models/Scoreboard");

const run = async (client, interaction) => {
    try {
        await interaction.deferReply();

        const board = await Scoreboard.findOne({ guildId: interaction.guild.id });

        if (!board || !board.players.length) {
            return interaction.editReply("No scoreboard data found.");
        }

        const guild = interaction.guild;

        // -----------------------------
        // MEMBER CACHE
        // -----------------------------
        const memberCache = new Map();

        for (const p of board.players) {
            try {
                const member = await guild.members.fetch(p.userId);
                memberCache.set(p.userId, member);
            } catch {
                memberCache.set(p.userId, null);
            }
        }

        // -----------------------------
        // WIN CALCULATION
        // -----------------------------
        const maxGames = Math.max(
            0,
            ...board.players.map(p => (Array.isArray(p.games) ? p.games.length : 0))
        );

        const winsMap = new Map();

        for (let i = 0; i < maxGames; i++) {
            const scores = board.players
                .map(p => {
                    const data = p._doc || p;
                    return {
                        userId: data.userId,
                        score: Array.isArray(data.games) ? data.games[i] : null
                    };
                })
                .filter(s => s.score !== null && s.score !== undefined);

            if (!scores.length) continue;

            scores.sort((a, b) => b.score - a.score);

            const topScore = scores[0].score;
            const winners = scores.filter(s => s.score === topScore);

            for (const w of winners) {
                winsMap.set(w.userId, (winsMap.get(w.userId) || 0) + 1);
            }
        }

        // -----------------------------
        // SORT PLAYERS
        // -----------------------------
        const sorted = board.players
            .map(p => {
                const data = p._doc || p;

                return {
                    ...data,
                    wins: winsMap.get(data.userId) || 0,
                    gamesPlayed: Array.isArray(data.games)
                        ? data.games.filter(g => g !== null && g !== undefined).length
                        : 0
                };
            })
            .sort((a, b) => b.wins - a.wins);

        // -----------------------------
        // HELPERS
        // -----------------------------
        const medal = (r) => {
            if (r === 1) return "🥇";
            if (r === 2) return "🥈";
            if (r === 3) return "🥉";
            return "•";
        };

        const pageSize = 10;
        let page = 0;
        let breakdownIndex = 0;

        const totalPages = Math.ceil(sorted.length / pageSize);

        const getLeaderboardEmbed = (pageIndex) => {
            const start = pageIndex * pageSize;
            const slice = sorted.slice(start, start + pageSize);

            const desc = slice.map((p, i) => {
                const rank = start + i + 1;
                const member = memberCache.get(p.userId);

                const name =
                    member?.nickname ||
                    p.username ||
                    "Unknown User";

                return `${medal(rank)} **${rank}. ${name}**
> Wins: **${p.wins}**
> Games Played: **${p.gamesPlayed}**`;
            }).join("\n\n");

            return new EmbedBuilder()
                .setTitle("🏆 Garry's Mod — Overall Wins Leaderboard")
                .setColor("#5865F2")
                .setDescription(desc || "No data")
                .setFooter({ text: `Page ${pageIndex + 1} / ${totalPages}` });
        };

        const getGameEmbed = (gameIndex) => {
            const scores = sorted
                .map(p => {
                    const member = memberCache.get(p.userId);
                    const name = member?.nickname || p.username || "Unknown User";

                    return {
                        name,
                        score: p.games?.[gameIndex]
                    };
                })
                .filter(s => s.score !== null && s.score !== undefined)
                .sort((a, b) => b.score - a.score);

            const desc = scores
                .map((s, i) => `${medal(i + 1)} **${s.name}** — ${s.score}`)
                .join("\n");

            return new EmbedBuilder()
                .setTitle(`🎮 Game ${gameIndex + 1} Breakdown`)
                .setColor("#2ECC71")
                .setDescription(desc || "No data")
                .setFooter({ text: `Game ${gameIndex + 1} / ${maxGames}` });
        };

        // -----------------------------
        // BUTTON ROWS
        // -----------------------------
        const leaderboardRow = () =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("⬅️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 0),

                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("➡️")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages - 1),

                new ButtonBuilder()
                    .setCustomId("breakdown")
                    .setLabel("📊 Breakdown")
                    .setStyle(ButtonStyle.Secondary)
            );

        const breakdownRow = () =>
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("gprev")
                    .setLabel("⬅️ Game")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(breakdownIndex === 0),

                new ButtonBuilder()
                    .setCustomId("gnext")
                    .setLabel("➡️ Game")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(breakdownIndex === maxGames - 1),

                new ButtonBuilder()
                    .setCustomId("back")
                    .setLabel("⬅️ Back")
                    .setStyle(ButtonStyle.Secondary)
            );

        // -----------------------------
        // INITIAL MESSAGE
        // -----------------------------
        const msg = await interaction.editReply({
            embeds: [getLeaderboardEmbed(page)],
            components: [leaderboardRow()]
        });

        // -----------------------------
        // COLLECTOR
        // -----------------------------
        const collector = msg.createMessageComponentCollector({
            time: 1000 * 60 * 5
        });

        collector.on("collect", async (btn) => {
            try {
                if (btn.user.id !== interaction.user.id) {
                    return btn.deferUpdate().catch(() => {});
                }

                // -------------------------
                // LEADERBOARD NAV
                // -------------------------
                if (btn.customId === "prev") page--;
                if (btn.customId === "next") page++;

                // -------------------------
                // BREAKDOWN OPEN
                // -------------------------
                if (btn.customId === "breakdown") {
                    breakdownIndex = 0;

                    return btn.update({
                        embeds: [getGameEmbed(breakdownIndex)],
                        components: [breakdownRow()]
                    }).catch(() => {});
                }

                // -------------------------
                // BREAKDOWN NAV
                // -------------------------
                if (btn.customId === "gprev") breakdownIndex--;
                if (btn.customId === "gnext") breakdownIndex++;

                if (btn.customId === "gprev" || btn.customId === "gnext") {
                    return btn.update({
                        embeds: [getGameEmbed(breakdownIndex)],
                        components: [breakdownRow()]
                    }).catch(() => {});
                }

                if (btn.customId === "back") {
                    return btn.update({
                        embeds: [getLeaderboardEmbed(page)],
                        components: [leaderboardRow()]
                    }).catch(() => {});
                }

                // -------------------------
                // DEFAULT UPDATE
                // -------------------------
                return btn.update({
                    embeds: [getLeaderboardEmbed(page)],
                    components: [leaderboardRow()]
                }).catch(() => {});

            } catch (err) {
                console.error("Button error:", err);
                return btn.deferUpdate().catch(() => {});
            }
        });

    } catch (err) {
        console.error(err);

        return interaction.reply({
            content: "Failed to perform this command",
            flags: MessageFlags.Ephemeral
        });
    }
};

module.exports = {
    name: "gmodscore",
    type: 1,
    category: "Games",
    description: "View Garry's Mod Scores",
    perm: "",
    devOnly: true,
    options: [],
    run
};