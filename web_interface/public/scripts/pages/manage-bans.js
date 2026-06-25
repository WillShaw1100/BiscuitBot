import { api } from "../core/api.js";
import { html } from "../core/dom.js";
import { initGuildSelector } from "../core/guilds.js";

document.addEventListener("DOMContentLoaded", () => {
    const guild = window.guilds.find(g => g.id === window.selectedGuild);

    if (guild) {
        document.getElementById("guildName").textContent = guild.name;
        document.getElementById("guildIcon").src =
            guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128`
                : "/assets/default_guild.png";
    }

    loadBans();
});

async function loadBans() {
    const list = document.getElementById("banList");

    try {
        const bans = await api("/bans/list");

        if (!bans.length) {
            html(list, `<div class="empty-msg">No banned users.</div>`);
            return;
        }

        html(list, bans.map(b => `
            <div class="ban-item">
                <img src="${b.avatar}">
                <div class="ban-info">
                    <b>${b.username}</b>
                    <span class="muted small">${b.id}</span>
                    <div class="reason">${b.reason}</div>
                </div>
            </div>
        `).join(""));
    } catch (err) {
        console.error(err);
        html(list, `<div class="error-msg">Failed to load bans.</div>`);
    }
}
