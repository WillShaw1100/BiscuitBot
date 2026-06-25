import { api } from "./api.js";

export function initGuildSelector(selectEl, guilds, selected) {
    selectEl.innerHTML = "";

    guilds.forEach(g => {
        const opt = document.createElement("option");
        opt.value = g.id;
        opt.textContent = g.name;
        if (g.id === selected) opt.selected = true;
        selectEl.appendChild(opt);
    });

    selectEl.addEventListener("change", async () => {
        await api("/auth/setGuild", {
            method: "POST",
            body: JSON.stringify({ guildId: selectEl.value })
        });

        location.reload();
    });
}
