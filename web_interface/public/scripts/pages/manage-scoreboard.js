import { $, $$, html } from "../core/dom.js";
import { api } from "../core/api.js";
import { initGuildSelector } from "../core/guilds.js";

let data = null;
let currentSeason = 1;
let currentGame = 0;
let allSeasons = [];
let chartInstance = null;

// ====================== INITIAL LOAD ======================
document.addEventListener("DOMContentLoaded", () => {
    initGuildSelector($("#guildName"), window.guilds, window.selectedGuild);

    // Search
    $("#search").addEventListener("input", debounce(searchUsers, 150));

    // Add game modal
    $("#addGameBtn").addEventListener("click", openModal);
    $("#closeModalBtn").addEventListener("click", closeModal);
    $("#saveGameBtn").addEventListener("click", submitGame);

    // Export (sidebar + hero)
    $("#exportBtn").addEventListener("click", () => {
        window.location = "/scoreboard/export";
    });
    $("#exportBtnHero").addEventListener("click", () => {
        window.location = "/scoreboard/export";
    });

    // Season reset modal
    $("#resetSeasonBtn").addEventListener("click", openSeasonReset);
    $("#cancelResetBtn").addEventListener("click", closeSeasonReset);
    $("#cancelResetBtnSecondary").addEventListener("click", closeSeasonReset);
    $("#confirmResetBtn").addEventListener("click", confirmSeasonReset);

    load();
});

function debounce(fn, delay) {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn(...args), delay);
    };
}

// ====================== LOAD DATA ======================
async function load() {
    data = await api("/scoreboard");
    currentSeason = data.season;

    allSeasons = await api("/scoreboard/seasons");

    renderSeasonLabel();
    renderSeasonTabs();
    renderPlayers();
    renderBestPlayer();
    renderTopThree();
    renderChart();
    renderHeatmap();
    renderGameTabs();
    renderGameTable();
}

function renderSeasonLabel() {
    const el = $("#seasonLabel");
    if (el) {
        el.textContent = `Season ${currentSeason}`;
    }
}

// ====================== SEASONS ======================
function renderSeasonTabs() {
    html(
        $("#seasonTabs"),
        allSeasons
            .map(
                season => `
        <div class="tab ${season === currentSeason ? "active" : ""}"
             data-season="${season}">
            Season ${season}
        </div>
    `
            )
            .join("")
    );

    $$("#seasonTabs .tab").forEach(el => {
        el.addEventListener("click", () => switchSeason(Number(el.dataset.season)));
    });
}

async function switchSeason(season) {
    data = await api(`/scoreboard?season=${season}`);
    currentSeason = data.season;

    renderSeasonLabel();
    renderSeasonTabs();
    renderPlayers();
    renderBestPlayer();
    renderTopThree();
    renderChart();
    renderHeatmap();
    renderGameTabs();
    renderGameTable();
}

// ====================== GAME TABS ======================
const maxGames = Math.max(0, ...data.players.map(p => (p.games || []).length));

const visibleGames = 5;
const startGame = Math.max(0, maxGames - visibleGames);
const gameCount = maxGames - startGame;

let out = `
    <div class="heatmap-grid" style="grid-template-columns: 120px repeat(${gameCount}, 24px)">
        <div></div>
        ${Array.from({ length: gameCount })
            .map((_, i) => `
                <div class="heatmap-header">G${startGame + i + 1}</div>
            `)
            .join("")}
`;

for (const p of data.players) {
    out += `
        <div class="heatmap-name">${p.username}</div>
        ${Array.from({ length: gameCount })
            .map((_, i) => {
                const gameIndex = startGame + i;
                const attended = (p.games || [])[gameIndex] != null;
                return `<div class="heatmap-cell ${attended ? "attended" : "missed"}"></div>`;
            })
            .join("")}
    `;
}

out += "</div>";

html($("#heatmap"), out);

// ====================== GAME TABLE ======================
function renderGameTable() {
    const rows = data.players
        .map(p => ({
            username: p.username,
            avatar: p.avatar,
            score: (p.games || [])[currentGame],
            points: (p.points || [])[currentGame]
        }))
        .filter(r => r.score != null)
        .sort((a, b) => b.score - a.score);

    if (!rows.length) {
        html($("#gameTable"), "<p>No data for this game.</p>");
        return;
    }

    html(
        $("#gameTable"),
        `
        <table>
            <tr>
                <th>Player</th>
                <th>Score</th>
                <th>Points</th>
            </tr>
            ${rows
                .map(
                    r => `
                <tr>
                    <td><img src="${r.avatar}" class="avatar-sm"> ${r.username}</td>
                    <td>${r.score}</td>
                    <td>${r.points ?? 0}</td>
                </tr>
            `
                )
                .join("")}
        </table>
    `
    );
}

// ====================== PLAYERS ======================
function renderPlayers() {
    const maxGames = Math.max(0, ...data.players.map(p => (p.games || []).length));

    html(
        $("#players"),
        data.players
            .map(p => {
                const gamesPlayed = (p.games || []).filter(g => g != null).length;
                const totalScore = (p.games || []).reduce((a, b) => a + (b || 0), 0);
                const avgScore = gamesPlayed ? (totalScore / gamesPlayed).toFixed(2) : "0.00";
                const points = (p.points || []).reduce((a, b) => a + (b || 0), 0);

                return `
        <div class="player" data-id="${p.userId}">
            <img src="${p.avatar}">
            <div class="player-info">
                <b>${p.username}</b>
                <div class="small">
                    Games Played: ${gamesPlayed} |
                    Total Score: ${totalScore} |
                    Avg Score: ${avgScore} |
                    Points: ${points}
                </div>
            </div>

            <div class="games">
                ${Array.from({ length: maxGames })
                    .map((_, i) => {
                        const g = p.games?.[i];
                        const medal = getMedal(i, p.userId);

                        return `
                    <div class="game">
                        <div class="medal">${medal}</div>
                        Game ${i + 1}
                        ${
                            g == null
                                ? `<div class="na">N/A</div>`
                                : `<input type="number" value="${g}" data-user="${p.userId}" data-index="${i}" class="score-input">`
                        }
                    </div>`;
                    })
                    .join("")}
            </div>
        </div>`;
            })
            .join("")
    );

    $$(".score-input").forEach(el => {
        el.addEventListener("change", () => {
            updateScore(el.dataset.user, Number(el.dataset.index), Number(el.value));
        });
    });

    $$("#players .player").forEach(el => {
        el.addEventListener("click", () => openProfile(el.dataset.id));
    });
}

// ====================== MEDALS ======================
function getMedal(gameIndex, userId) {
    const arr = data.players
        .map(p => ({
            id: p.userId,
            score: (p.games || [])[gameIndex]
        }))
        .filter(x => x.score != null)
        .sort((a, b) => b.score - a.score);

    let rank = 0;
    let last = null;

    for (let i = 0; i < arr.length; i++) {
        if (arr[i].score !== last) {
            rank = i + 1;
            last = arr[i].score;
        }
        if (arr[i].id === userId) {
            return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
        }
    }
    return "";
}

// ====================== UPDATE SCORE ======================
async function updateScore(userId, gameIndex, value) {
    await api("/scoreboard/updateGame", {
        method: "POST",
        body: JSON.stringify({ userId, gameIndex, value })
    });
    load();
}

// ====================== SEARCH USERS ======================
async function searchUsers() {
    const q = $("#search").value.trim();
    if (!q) {
        html($("#results"), "");
        return;
    }

    const users = await api(`/scoreboard/search?q=${encodeURIComponent(q)}`);

    html(
        $("#results"),
        users
            .map(
                u => `
        <div class="result-item" data-id="${u.id}">
            <img src="${u.avatar}">
            <div>${u.username}</div>
        </div>
    `
            )
            .join("")
    );

    $$("#results .result-item").forEach(el => {
        el.addEventListener("click", () => addUser(el.dataset.id));
    });
}

// ====================== ADD USER ======================
async function addUser(id) {
    await api("/scoreboard/add", {
        method: "POST",
        body: JSON.stringify({ userId: id })
    });

    $("#search").value = "";
    html($("#results"), "");
    load();
}

// ====================== ADD GAME MODAL ======================
function openModal() {
    $("#modal").style.display = "flex";

    html(
        $("#modalPlayers"),
        data.players
            .map(
                p => `
        <div class="row">
            <input type="checkbox" data-id="${p.userId}" class="modal-check">
            <img src="${p.avatar}">
            <div>${p.username}</div>
            <input type="number" data-id="${p.userId}" class="modal-score">
        </div>
    `
            )
            .join("")
    );
}

function closeModal() {
    $("#modal").style.display = "none";
}

async function submitGame() {
    const results = [];

    $$(".modal-check").forEach(c => {
        if (c.checked) {
            const scoreInput = $(`.modal-score[data-id="${c.dataset.id}"]`);
            results.push({
                userId: c.dataset.id,
                score: Number(scoreInput.value || 0)
            });
        }
    });

    if (!results.length) {
        closeModal();
        return;
    }

    await api("/scoreboard/addGameWithScores", {
        method: "POST",
        body: JSON.stringify({ results })
    });

    closeModal();
    load();
}

// ====================== SEASON RESET ======================
function openSeasonReset() {
    $("#seasonModal").style.display = "flex";
}

function closeSeasonReset() {
    $("#seasonModal").style.display = "none";
}

async function confirmSeasonReset() {
    await api("/scoreboard/resetSeason", { method: "POST" });
    closeSeasonReset();
    load();
}

// ====================== PROFILE PANEL ======================
function openProfile(userId) {
    const p = data.players.find(x => x.userId === userId);
    if (!p) return;

    const gamesPlayed = (p.games || []).filter(g => g != null).length;
    const totalScore = (p.games || []).reduce((a, b) => a + (b || 0), 0);
    const avgScore = gamesPlayed ? (totalScore / gamesPlayed).toFixed(2) : "0.00";
    const totalPoints = (p.points || []).reduce((a, b) => a + (b || 0), 0);

    const breakdown = (p.games || [])
        .map((g, i) => {
            const pts = (p.points || [])[i] ?? 0;
            return `
        <div class="small">
            Game ${i + 1}: ${g ?? "N/A"} (Points: ${pts})
        </div>
    `;
        })
        .join("");

    html(
        $("#profilePanel"),
        `
        <button class="icon-btn" onclick="document.getElementById('profilePanel').style.right='-420px'">✕</button>
        <h2>${p.username}</h2>
        <img src="${p.avatar}" class="profile-avatar">
        <p>Total Score: ${totalScore}</p>
        <p>Average Score: ${avgScore}</p>
        <p>Total Points: ${totalPoints}</p>
        <h3>Game Breakdown</h3>
        ${breakdown}
    `
    );

    $("#profilePanel").style.right = "0";
}

// ====================== BEST PLAYER ======================
function renderBestPlayer() {
    if (!data.players?.length) {
        html($("#bestPlayer"), "<p>No players yet.</p>");
        return;
    }

    const sorted = [...data.players].sort((a, b) => {
        const aPoints = (a.points || []).reduce((x, y) => x + (y || 0), 0);
        const bPoints = (b.points || []).reduce((x, y) => x + (y || 0), 0);
        return bPoints - aPoints;
    });

    const best = sorted[0];

    const totalPoints = (best.points || []).reduce((a, b) => a + (b || 0), 0);
    const gamesPlayed = (best.games || []).filter(g => g != null).length;

    html(
        $("#bestPlayer"),
        `
        <div class="top-player-card">
            <div class="crown">👑</div>
            <img src="${best.avatar}" class="top-player-avatar">
            <h3>${best.username}</h3>
            <div class="small">Best Overall Player</div>
            <div class="points">${totalPoints} pts</div>
            <div class="small">${gamesPlayed} games played</div>
        </div>
    `
    );
}

// ====================== TOP THREE ======================
function renderTopThree() {
    if (!data.players?.length) {
        html($("#topThree"), "");
        return;
    }

    const sorted = [...data.players].sort((a, b) => {
        const aPoints = (a.points || []).reduce((x, y) => x + (y || 0), 0);
        const bPoints = (b.points || []).reduce((x, y) => x + (y || 0), 0);
        return bPoints - aPoints;
    });

    const medals = ["🥇", "🥈", "🥉"];

    html(
        $("#topThree"),
        `
        <div class="top-three-grid">
            ${sorted
                .slice(0, 3)
                .map((p, i) => {
                    const pts = (p.points || []).reduce((a, b) => a + (b || 0), 0);

                    return `
                    <div class="top-three-card">
                        <div class="medal-large">${medals[i]}</div>
                        <img src="${p.avatar}" class="top-three-avatar">
                        <div><strong>${p.username}</strong></div>
                        <div class="small">${pts} pts</div>
                    </div>
                `;
                })
                .join("")}
        </div>
    `
    );
}

// ====================== CHART ======================
function renderChart() {
    const ctx = $("#statsChart").getContext("2d");

    const players = [...data.players]
        .map(p => ({
            username: p.username,
            total: (p.games || []).reduce((a, b) => a + (b || 0), 0)
        }))
        .sort((a, b) => b.total - a.total);

    const labels = players.map(p => p.username);
    const totals = players.map(p => p.total);

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [
                {
                    label: "Total Score",
                    data: totals,
                    backgroundColor: "#5865f2"
                }
            ]
        },
        options: {
        responsive: true,
        indexAxis: "y",
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                beginAtZero: true
            }
        }
    }
    });
}

// ====================== HEATMAP ======================
function renderHeatmap() {
    if (!data.players?.length) {
        html($("#heatmap"), "<p class='small'>No players yet.</p>");
        return;
    }

    const maxGames = Math.max(0, ...data.players.map(p => (p.games || []).length));

    if (maxGames === 0) {
        html($("#heatmap"), "<p class='small'>No games yet this season.</p>");
        return;
    }

    let out = `
        <div class="heatmap-grid" style="grid-template-columns: 120px repeat(${maxGames}, 24px)">
            <div></div>
            ${Array.from({ length: maxGames })
                .map(
                    (_, i) => `
                <div class="heatmap-header">G${i + 1}</div>
            `
                )
                .join("")}
    `;

    for (const p of data.players) {
        out += `
            <div class="heatmap-name">${p.username}</div>
            ${Array.from({ length: maxGames })
                .map((_, i) => {
                    const g = (p.games || [])[i];
                    const attended = g != null;
                    const cls = attended ? "attended" : "missed";
                    return `<div class="heatmap-cell ${cls}"></div>`;
                })
                .join("")}
        `;
    }

    out += `</div>`;

    html($("#heatmap"), out);
}

// Close modals when clicking outside (final stable version)
document.addEventListener("mousedown", e => {
    const modalBg = $("#modal");
    const seasonBg = $("#seasonModal");
    const profile = $("#profilePanel");

    // ADD GAME MODAL
    if (modalBg.style.display === "flex") {
        const box = modalBg.querySelector(".modal");

        // Only close if clicking the background itself
        if (e.target === modalBg) {
            closeModal();
        }
    }

    // SEASON RESET MODAL
    if (seasonBg.style.display === "flex") {
        const box = seasonBg.querySelector(".modal");

        if (e.target === seasonBg) {
            closeSeasonReset();
        }
    }

    // PROFILE PANEL
    if (profile.style.right === "0px") {
        if (!profile.contains(e.target)) {
            profile.style.right = "-420px";
        }
    }
});


document.addEventListener("mousedown", e => {
    if (e.target.classList.contains("modal-check")) {
        e.stopPropagation();
    }
});

