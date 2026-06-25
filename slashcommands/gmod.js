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

        const season = interaction.options.getInteger("season");

        let board;

        if (season) {
            board = await Scoreboard.findOne({
                guildId: interaction.guild.id,
                season
            });
        } else {
            board = await Scoreboard.findOne({
                guildId: interaction.guild.id
            }).sort({ season: -1 });
        }

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
        // TOTAL POINTS SORT (MAIN CHANGE)
        // -----------------------------
        const sorted = board.players
            .map(p => {
                const data = p._doc || p;

                const totalPoints = Array.isArray(data.points)
                    ? data.points.reduce((a, b) => a + (b || 0), 0)
                    : 0;

                const gamesPlayed = Array.isArray(data.games)
                    ? data.games.filter(g => g !== null && g !== undefined).length
                    : 0;

                const totalScore = Array.isArray(data.games)
                    ? data.games.reduce((a, b) => a + (b || 0), 0)
                    : 0;

                return {
                    ...data,
                    totalPoints,
                    totalScore,
                    gamesPlayed,
                };
            })
            .sort((a, b) => b.totalPoints - a.totalPoints);

        // -----------------------------
        // HELPERS
        // -----------------------------
        const medal = (r) => {
            if (r === 1) return "🥇";
            if (r === 2) return "🥈";
            if (r === 3) return "🥉";
            return "•";
        };

        const pageSize = 5; // 🔥 UPDATED
        let page = 0;
        let breakdownIndex = 0;

        const totalPages = Math.ceil(sorted.length / pageSize);

        // -----------------------------
        // LEADERBOARD EMBED (POINT-BASED)
        // -----------------------------
        const getLeaderboardEmbed = (pageIndex) => {
            const start = pageIndex * pageSize;
            const slice = sorted.slice(start, start + pageSize);

            return new EmbedBuilder()
                .setTitle(`🏆 TTT Scoreboard — Season ${board.season} Leaderboard`)
                .setColor("#5865F2")
                .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
                .setFooter({text: `Season ${board.season} • Page ${pageIndex + 1}/${totalPages}`})
                .setDescription(
                    slice.map((p, i) => {
                        const rank = start + i + 1;
                        const member = memberCache.get(p.userId);

                        const name =
                            member?.nickname ||
                            p.username ||
                            "Unknown User";

                        return (
                            `${medal(rank)} **#${rank} — ${name}**\n` +
                            `⭐ Points: **${p.totalPoints}**\n` +
                            `🎯 Total Score: **${p.totalScore}**\n` +
                            `🗓️ Games Played: **${p.gamesPlayed}**`
                        );
                    }).join("\n\n")
                );
        };

        // -----------------------------
        // GAME BREAKDOWN EMBED
        // -----------------------------
        const maxGames = Math.max(
            0,
            ...board.players.map(p => (Array.isArray(p.games) ? p.games.length : 0))
        );

        const getGameEmbed = (gameIndex) => {
            const scores = sorted
                .map(p => {
                    const member = memberCache.get(p.userId);
                    const name = member?.nickname || p.username || "Unknown User";

                    return {
                        name,
                        score: p.games?.[gameIndex],
                        points: p.points?.[gameIndex] ?? 0
                    };
                })
                .filter(s => s.score != null)
                .sort((a, b) => b.score - a.score);

            return new EmbedBuilder()
            .setTitle(`🎮 Season ${board.season} • Game ${gameIndex + 1}`)
                .setColor("#2ECC71")
                .setDescription(
                    scores.map((s, i) =>
                        `${medal(i + 1)} **${s.name}**\n` +
                        `> Score: **${s.score}** | Points: **${s.points}**`
                    ).join("\n\n") || "No data"
                )
                .setFooter({text: `Season ${board.season} • Game ${gameIndex + 1}/${maxGames}`})
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

                if (btn.customId === "prev") page--;
                if (btn.customId === "next") page++;

                if (btn.customId === "breakdown") {
                    breakdownIndex = 0;

                    return btn.update({
                        embeds: [getGameEmbed(breakdownIndex)],
                        components: [breakdownRow()]
                    });
                }

                if (btn.customId === "gprev") breakdownIndex--;
                if (btn.customId === "gnext") breakdownIndex++;

                if (btn.customId === "gprev" || btn.customId === "gnext") {
                    return btn.update({
                        embeds: [getGameEmbed(breakdownIndex)],
                        components: [breakdownRow()]
                    });
                }

                if (btn.customId === "back") {
                    return btn.update({
                        embeds: [getLeaderboardEmbed(page)],
                        components: [leaderboardRow()]
                    });
                }

                return btn.update({
                    embeds: [getLeaderboardEmbed(page)],
                    components: [leaderboardRow()]
                });

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
    options: [
        {
            name: "season",
            type: 4,
            description: "Specify a season to view",
            required: false
        }
    ],
    run
};